import prisma from "../../../db.server";

/**
 * Shopify GraphQL API returns product IDs as GIDs:
 *   "gid://shopify/Product/9876543210"
 * Webhooks store them as plain numbers:
 *   9876543210
 * This normalises both to the numeric string "9876543210".
 */
function extractNumericId(id) {
  if (!id) return "";
  const str = String(id);
  // GID format — take the last segment
  if (str.includes("/")) return str.split("/").pop();
  return str;
}

export async function getOrdersWithStatus(orders, storeId) {
  const ordersDb = await prisma.order.findMany({
    where: {
      storeId,
    },
    select: {
      userEmail: true,
      orderId: true,
      reviewCheckStatus: true,
      requestType: true,
      productsJson: true,
    },
  });

  // Create lookup map keyed by "email-orderId"
  const orderMap = new Map(
    ordersDb.map((order) => [
      `${order.userEmail}-${order.orderId}`,
      {
        reviewCheckStatus: order.reviewCheckStatus,
        requestType: order.requestType,
        // productsJson is stored as an array of { productId, isReviewed, ... }
        productsJson: Array.isArray(order.productsJson) ? order.productsJson : [],
      },
    ]),
  );

  // Merge reviewCheckStatus, requestType, and per-product isReviewed into Shopify orders
  return orders.map((order) => {
    const key = `${order.email}-${order.orderId}`;
    const dbData = orderMap.get(key);

    // Build productId → dbProduct map, normalising IDs to numeric strings
    const dbProductMap = new Map(
      (dbData?.productsJson ?? []).map((p) => [extractNumericId(p.productId), p]),
    );

    const mergedProducts = (order.products ?? []).map((product) => {
      const dbProduct = dbProductMap.get(extractNumericId(product.productId));
      return {
        ...product,
        isReviewed: dbProduct?.isReviewed ?? false,
      };
    });

    return {
      ...order,
      products: mergedProducts,
      reviewCheckStatus: dbData?.reviewCheckStatus ?? "PENDING",
      requestType: dbData?.requestType ?? "AUTOMATIC",
    };
  });
}

