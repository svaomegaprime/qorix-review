import crypto from "node:crypto";

import { getRelativeTime } from "./getRelativeTime.js";

/**
 * Convert an Admin REST webhook order into the application's order shape.
 *
 * @param {Record<string, any>} order
 * @returns {Record<string, any>}
 */
export function formatOrder(order) {
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

  return {
    id: order.name,
    orderId: order.name,
    fullName,
    email,
    emailVerified: customer.verified_email || false,
    avatar: `https://www.gravatar.com/avatar/${emailHash}?d=identicon`,
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
