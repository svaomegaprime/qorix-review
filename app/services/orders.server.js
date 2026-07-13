import prisma from "../db.server.js";
import { getOrders } from "../utils/sync.orders.js";
import { enrichOrderProducts } from "./productEnrichment.server.js";

function normalizeShopifyId(value) {
  if (!value) return "";
  return String(value).split("/").pop();
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

export async function upsertOrderWithLineItems({
  formattedOrder,
  storeId,
  reviewCheckStatus = "PENDING",
  requestType = "AUTOMATIC",
}) {
  const products = formattedOrder.products ?? [];
  const orderFields = {
    orderId: formattedOrder.orderId,
    fulfillmentStatus: formattedOrder.fulfillmentStatus ?? "unfulfilled",
    paymentStatus: formattedOrder.status,
    userEmail: formattedOrder.email,
    reviewCheckStatus,
    requestType,
    totalPrice: formattedOrder.totalPrice,
    currency: formattedOrder.currency,
  };

  return prisma.$transaction(async (tx) => {
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
}

export async function markOrderProductReviewed({
  storeId,
  orderId,
  reviewerEmail,
  productId,
}) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { storeId, orderId, userEmail: reviewerEmail },
      include: { lineItems: true },
    });

    if (!order) return false;

    const normalizedProductId = normalizeShopifyId(productId);
    const lineItem = order.lineItems.find(
      (item) => normalizeShopifyId(item.productId) === normalizedProductId,
    );

    if (!lineItem) {
      throw new Error("Reviewed product was not found in the existing order");
    }

    await tx.orderLineItem.update({
      where: { id: lineItem.id },
      data: { isReviewed: true },
    });

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
        String(order.email ?? "").trim().toLowerCase() === normalizedEmail &&
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
      isReviewed:
        normalizeShopifyId(product.productId) === normalizedProductId,
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
