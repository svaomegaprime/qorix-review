import crypto from "crypto";

export async function getOrders(shop, token) {
  const query = `
    query GetOrders($first: Int!) {
      orders(first: $first, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            name
            email
            createdAt
            displayFinancialStatus
            displayFulfillmentStatus
            currentTotalPriceSet {
            shopMoney {
              amount
              currencyCode
              }
            }
            customer {
              firstName
              lastName
              verifiedEmail
            }
            billingAddress {
              name
            }
            lineItems(first: 50) {
              edges {
                node {
                  title
                  quantity
                  product {
                    id
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(
    `https://${shop}/admin/api/2025-01/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({
        query,
        variables: { first: 250 },
      }),
    }
  );

  const { data, errors } = await response.json();

  if (errors) {
    console.error("GraphQL errors:", errors);
    return [];
  }

  const orders = data?.orders?.edges || [];

  return orders.map(({ node: order }) => {
    const customer = order.customer || {};
    const fullName =
      `${customer.firstName || ""} ${customer.lastName || ""}`.trim() ||
      order.billingAddress?.name ||
      "N/A";

    const email = order.email || "";

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
      emailVerified: customer.verifiedEmail || false,
      avatar,
      status: order.displayFinancialStatus,
      fulfillmentStatus: order.displayFulfillmentStatus,
      createdAt: order.createdAt,
      timeAgo: getRelativeTime(order.createdAt),
      totalPrice: order.currentTotalPriceSet?.shopMoney?.amount || "0.00",
      currency: order.currentTotalPriceSet?.shopMoney?.currencyCode,
      products: (order.lineItems?.edges || []).map(({ node: item }) => ({
        title: item.title,
        productId: item.product?.id || null,
        quantity: item.quantity,
        handle: item.product?.handle || null,
        url: item.product?.url || null,
      })),
    };
  });
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
  if (diffMonth < 12) return `${diffMonth} month${diffMonth > 1 ? "s" : ""} ago`;
  return `${diffYear} year${diffYear > 1 ? "s" : ""} ago`;
}