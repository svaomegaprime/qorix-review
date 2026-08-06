import prisma from "../db.server.js";
import { getOrders } from "../utils/sync.orders.js";
import { enrichOrderProducts } from "./productEnrichment.server.js";
import { normalizeShopifyId } from "../utils/shopifyGid.js";

async function findOrderReviewTarget(
  client,
  { storeId, orderId, reviewerEmail, productId },
) {
  const order = await client.order.findFirst({
    where: {
      storeId,
      orderId,
      userEmail: {
        equals: String(reviewerEmail).trim(),
        mode: "insensitive",
      },
    },
    include: { lineItems: true },
  });

  if (!order) return null;

  const normalizedProductId = normalizeShopifyId(productId);
  const lineItem = order.lineItems.find(
    (item) => normalizeShopifyId(item.productId) === normalizedProductId,
  );

  return lineItem ? { order, lineItem } : null;
}

export async function getOrderReviewTarget(args) {
  return findOrderReviewTarget(prisma, args);
}

export async function getReviewedProductIdsForOrder({ storeId, orderId }) {
  const order = await prisma.order.findUnique({
    where: {
      storeId_orderId: { storeId, orderId },
    },
    select: {
      reviews: {
        select: { productId: true },
      },
    },
  });

  return new Set(
    (order?.reviews ?? []).map((review) =>
      normalizeShopifyId(review.productId),
    ),
  );
}

function getReviewCheckStatus({ currentStatus, products, nextStatus }) {
  const productList = products ?? [];
  const hasProducts = productList.length > 0;
  const allReviewed =
    hasProducts && productList.every((product) => product.isReviewed === true);

  if (currentStatus === "REVIEWED" || allReviewed) return "REVIEWED";
  return nextStatus;
}

async function replaceOrderLineItems(tx, orderDbId, products) {
  await tx.orderLineItem.deleteMany({ where: { orderId: orderDbId } });
  const persistableProducts = products.filter(
    (product) =>
      product.productId !== null &&
      product.productId !== undefined &&
      product.productId !== "",
  );
  if (persistableProducts.length === 0) return;

  await tx.orderLineItem.createMany({
    data: persistableProducts.map((product) => ({
      orderId: orderDbId,
      productId: String(product.productId),
      title: product.title,
      quantity: product.quantity,
      handle: product.productHandle ?? product.handle ?? null,
      url: product.url ?? null,
      image: product.image ?? null,
      isReviewed: product.isReviewed ?? false,
    })),
  });
}

export async function upsertOrderWithLineItems(
  {
    formattedOrder,
    storeId,
    reviewCheckStatus = "PENDING",
    requestType = "AUTOMATIC",
  },
  retries = 3,
) {
  const products = formattedOrder.products ?? [];
  const existingOrder = await prisma.order.findUnique({
    where: {
      storeId_orderId: { storeId, orderId: formattedOrder.orderId },
    },
    select: {
      reviewCheckStatus: true,
    },
  });
  const orderFields = {
    orderId: formattedOrder.orderId,
    fulfillmentStatus: formattedOrder.fulfillmentStatus ?? "unfulfilled",
    paymentStatus: formattedOrder.status,
    userEmail: formattedOrder.email,
    reviewCheckStatus: getReviewCheckStatus({
      currentStatus: existingOrder?.reviewCheckStatus,
      products,
      nextStatus: reviewCheckStatus,
    }),
    requestType,
    totalPrice: formattedOrder.totalPrice,
    currency: formattedOrder.currency,
  };

  try {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.upsert({
        where: {
          storeId_orderId: { storeId, orderId: formattedOrder.orderId },
        },
        update: orderFields,
        create: {
          ...orderFields,
          store: { connect: { storeGID: storeId } },
        },
      });

      await replaceOrderLineItems(tx, order.id, products);
      return order;
    });
  } catch (error) {
    if (error.code === "P2002" && retries > 0) {
      console.warn("Race condition in upsertOrderWithLineItems, retrying...");
      return upsertOrderWithLineItems(
        { formattedOrder, storeId, reviewCheckStatus, requestType },
        retries - 1,
      );
    }
    throw error;
  }
}

export async function markOrderProductReviewed({
  storeId,
  orderId,
  reviewerEmail,
  productId,
  reviewId,
}) {
  return prisma.$transaction(async (tx) => {
    const target = await findOrderReviewTarget(tx, {
      storeId,
      orderId,
      reviewerEmail,
      productId,
    });

    if (!target) return false;

    const { order, lineItem } = target;

    await tx.orderLineItem.update({
      where: { id: lineItem.id },
      data: { isReviewed: true },
    });

    if (reviewId) {
      await tx.review.update({
        where: { id: reviewId },
        data: { orderRecordId: order.id },
      });
    }

    const remainingUnreviewed = await tx.orderLineItem.count({
      where: {
        orderId: order.id,
        isReviewed: false,
        id: { not: lineItem.id },
      },
    });

    if (remainingUnreviewed === 0) {
      await tx.order.update({
        where: { id: order.id },
        data: { reviewCheckStatus: "REVIEWED" },
      });
    }

    return true;
  });
}

export async function syncReviewedOrderFromShopify({
  session,
  admin,
  storeId,
  reviewerEmail,
  productId,
}) {
  if (!session?.shop || !session?.accessToken) {
    console.warn("Cannot sync reviewed order without an offline session");
    return null;
  }

  try {
    const normalizedEmail = reviewerEmail.trim().toLowerCase();
    const normalizedProductId = normalizeShopifyId(productId);
    const shopifyOrders = await getOrders(session.shop, session.accessToken);
    const matchedOrder = shopifyOrders.find(
      (order) =>
        String(order.email ?? "")
          .trim()
          .toLowerCase() === normalizedEmail &&
        (order.products ?? []).some(
          (product) =>
            normalizeShopifyId(product.productId) === normalizedProductId,
        ),
    );

    if (!matchedOrder) {
      console.warn("No Shopify order matched the submitted review", {
        storeId,
        productId,
      });
      return null;
    }

    const enrichedOrder = await enrichOrderProducts(
      matchedOrder,
      admin,
      session.shop,
    );
    enrichedOrder.products = enrichedOrder.products.map((product) => ({
      ...product,
      isReviewed: normalizeShopifyId(product.productId) === normalizedProductId,
    }));

    await upsertOrderWithLineItems({
      formattedOrder: enrichedOrder,
      storeId,
      reviewCheckStatus: "REVIEWED",
      requestType: "MANUAL",
    });

    return enrichedOrder;
  } catch (error) {
    // A synchronization failure must not turn an already-created review into
    // a failed submission that the customer may retry and duplicate.
    console.error("Failed to sync the reviewed Shopify order", error);
    return null;
  }
}
