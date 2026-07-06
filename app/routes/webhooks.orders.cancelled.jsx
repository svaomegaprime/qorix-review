import crypto from "crypto";
import { authenticate, unauthenticated } from "../shopify.server";
import prisma from "../db.server";
import { getStoreData } from "../utils/getStoreData";

export const action = async ({ request }) => {
  const { topic, shop, payload } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);

  if (topic === "ORDERS_CANCELLED") {
    const formattedOrder = formatOrder(payload);

    console.log("Order cancelled:", payload);

    // Get store ID via unauthenticated admin client (correct for webhooks)
    const { admin } = await unauthenticated.admin(shop);
    const storeData = await getStoreData(admin);
    const storeId = storeData?.id;

    const storeSettings = await prisma.storeSettings.findFirst({
      where: {
        storeId,
      },
      include: {
        requestScheduling: true,
        emailSettings: true,
        publishingModeration: true,
        widgetsSettings: true,
        brandingSettings: true,
        adminNotification: true,
      },
    });

    if (!storeSettings) {
      console.warn("No storeSettings found for storeId:", storeId);
      return new Response(null, { status: 200 });
    }

    const settingConfig = {
      isAutomaticRequest: storeSettings.requestScheduling.isAutomaticRequest,
      isReminderRequest: storeSettings.requestScheduling.isReminderRequest,
      isSkipRefundedOrder: storeSettings.requestScheduling.isSkipRefundedOrder,
      isSkipCancelledOrder:
        storeSettings.requestScheduling.isSkipCancelledOrder,
      minimumOrderValue: storeSettings.requestScheduling.minimumOrderValue,
      sendRequestAfterDelivery:
        storeSettings.requestScheduling.sendRequestAfterDelivery,
      reminderRequestDelay:
        storeSettings.requestScheduling.reminderRequestDelay,
    };

    const isCancelled =
      settingConfig.isSkipCancelledOrder &&
      formattedOrder.cancelReason !== null;

    console.log("========================================================");
    console.log("Setting config:", settingConfig);
    console.log("Is Cancelled (should skip?):", isCancelled);
    console.log("========================================================");

    // TODO: add cancellation business logic here
    // e.g. cancel pending review request emails / jobs

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
    cancelReason: order.cancel_reason ?? null,
    cancelledAt: order.cancelled_at ?? null,
    fulfillmentStatus: order.fulfillment_status,
    createdAt: order.created_at,
    timeAgo: getRelativeTime(order.created_at),
    totalPrice: order.current_total_price,
    currency: order.subtotal_price_set?.shop_money?.currency_code ?? "N/A",
    products: (order.line_items || []).map((item) => ({
      title: item.title,
      productId: item.product_id,
      productHandle: item.handle,
      quantity: item.quantity,
      url: item.url,
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
