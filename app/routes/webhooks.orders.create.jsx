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

    // Build a Set of reviewed productIds for O(1) lookup
    const reviewedProductIds = new Set(existReview.map((r) => String(r.productId)));

    // Always stamp isReviewed on every product (true or false)
    formattedOrder.products = formattedOrder.products.map((item) => ({
      ...item,
      isReviewed: reviewedProductIds.has(String(item.productId)),
    }));


    const orderFields = {
      orderId: formattedOrder.orderId,
      fulfillmentStatus: formattedOrder.fulfillmentStatus ?? "unfulfilled",
      paymentStatus: formattedOrder.status,
      userEmail: formattedOrder.email,
      productsJson: formattedOrder.products,
      reviewCheckStatus: "PENDING",
      totalPrice: formattedOrder.totalPrice,
      currency: formattedOrder.currency,
    };
    await prisma.order.upsert({
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
