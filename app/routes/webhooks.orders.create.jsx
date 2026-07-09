import crypto from "crypto";
import { authenticate, unauthenticated } from "../shopify.server";
import prisma from "../db.server";
import { getStoreData } from "../utils/getStoreData";

export const action = async ({ request }) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  if (topic === "ORDERS_CREATE") {
    const order = payload;
    const formattedOrder = formatOrder(order);
    const { admin } = await unauthenticated.admin(shop);
    const { id } = await getStoreData(admin);

    const existReview = await prisma.review.findMany({
      where: {
        storeId: id,
        productId: {
          in: formattedOrder.products.map((item) => String(item.productId)),
        },
        reviewerEmail: formattedOrder.email,
      },
      select: { productId: true },
    });

    const reviewedProductIds = new Set(
      existReview.map((r) => String(r.productId)),
    );

    formattedOrder.products = formattedOrder.products.map((item) => ({
      ...item,
      isReviewed: reviewedProductIds.has(String(item.productId)),
    }));

    const orderFields = {
      orderId: formattedOrder.orderId,
      fulfillmentStatus: formattedOrder.fulfillmentStatus ?? "unfulfilled",
      paymentStatus: formattedOrder.status,
      userEmail: formattedOrder.email,
      reviewCheckStatus: "PENDING",
      totalPrice: formattedOrder.totalPrice,
      currency: formattedOrder.currency,
    };

    const upsertLineItems = async (tx, orderDbId) => {
      await tx.orderLineItem.deleteMany({
        where: { orderId: orderDbId },
      });

      if (formattedOrder.products && formattedOrder.products.length > 0) {
        await tx.orderLineItem.createMany({
          data: formattedOrder.products.map((p) => ({
            orderId: orderDbId,
            productId: String(p.productId),
            title: p.title,
            quantity: p.quantity,
            handle: p.productHandle ?? p.handle ?? null,
            url: p.url ?? null,
            image: p.image ?? null,
            isReviewed: p.isReviewed ?? false,
          })),
        });
      }
    };

    try {
      await prisma.$transaction(async (tx) => {
        // Upsert order header
        const orderDb = await tx.order.upsert({
          where: {
            storeId_orderId: {
              storeId: id,
              orderId: formattedOrder.orderId,
            },
          },
          update: orderFields,
          create: {
            ...orderFields,
            store: { connect: { storeGID: id } },
          },
        });

        await upsertLineItems(tx, orderDb.id);
      });
    } catch (error) {
      // P2002: duplicate webhook — the order already exists; fall back to a plain update
      if (error?.code === "P2002") {
        console.warn(
          "Duplicate order create webhook, updating existing order",
          {
            storeId: id,
            orderId: formattedOrder.orderId,
          },
        );

        await prisma.$transaction(async (tx) => {
          const existingOrder = await tx.order.findUnique({
            where: {
              storeId_orderId: {
                storeId: id,
                orderId: formattedOrder.orderId,
              },
            },
          });

          if (existingOrder) {
            await tx.order.update({
              where: { id: existingOrder.id },
              data: orderFields,
            });

            await upsertLineItems(tx, existingOrder.id);
          }
        });
      } else {
        console.error("Failed to upsert order and line items", error);
        throw error;
      }
    }

    return new Response(JSON.stringify(formattedOrder), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(null, { status: 200 });
};

function formatOrder(order) {
  const customer = order.customer || {};
  const fullName =
    `${customer.first_name || ""} ${customer.last_name || ""}`.trim() ||
    order.billing_address?.name ||
    "N/A";

  const email = order.email || customer.email || "";

  const emailHash = crypto
    .createHash("md5")
    .update(email.trim().toLowerCase())
    .digest("hex");
  const avatar = `https://www.gravatar.com/avatar/${emailHash}?d=identicon`;

  return {
    id: order.name,
    orderId: order.name,
    fullName,
    email,
    emailVerified: customer.verified_email || false,
    avatar,
    status: order.financial_status,
    fulfillmentStatus: order.fulfillment_status,
    createdAt: order.created_at,
    timeAgo: getRelativeTime(order.created_at),

    totalPrice: order.current_total_price,
    currency: order.subtotal_price_set.shop_money.currency_code,

    products: (order.line_items || []).map((item) => ({
      title: item.title,
      productId: item.product_id,
      productHandle: item.handle ?? null,
      quantity: item.quantity,
      url: item.url ?? null,
    })),
  };
}

function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  if (diffMonth < 12)
    return `${diffMonth} month${diffMonth > 1 ? "s" : ""} ago`;
  return `${diffYear} year${diffYear > 1 ? "s" : ""} ago`;
}
