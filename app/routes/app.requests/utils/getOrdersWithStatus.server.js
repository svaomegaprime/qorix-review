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
      lineItems: true,
      reviews: true,
    },
  });

  // Orders are already scoped by storeId, so orderId is the stable join key.
  const orderMap = new Map(
    ordersDb.map((order) => [
      order.orderId,
      {
        reviewCheckStatus: order.reviewCheckStatus,
        requestType: order.requestType,
        // Map relational lineItems to virtual productsJson for backward compatibility
        productsJson: order.lineItems || [],
        reviews: order.reviews,
      },
    ]),
  );

  // Merge reviewCheckStatus, requestType, and per-product isReviewed into Shopify orders
  return orders.map((order) => {
    const dbData = orderMap.get(order.orderId);

    // Build productId → dbProduct map, normalising IDs to numeric strings
    const dbProductMap = new Map(
      (dbData?.productsJson ?? []).map((p) => [
        extractNumericId(p.productId),
        p,
      ]),
    );
    const reviewedProductIds = new Set(
      (dbData?.reviews ?? []).map((review) =>
        extractNumericId(review.productId),
      ),
    );

    const mergedProducts = (order.products ?? []).map((product) => {
      const productId = extractNumericId(product.productId);
      const dbProduct = dbProductMap.get(productId);
      return {
        ...product,
        isReviewed:
          dbProduct?.isReviewed === true || reviewedProductIds.has(productId),
      };
    });
    const allProductsReviewed =
      mergedProducts.length > 0 &&
      mergedProducts.every((product) => product.isReviewed === true);

    return {
      ...order,
      products: mergedProducts,
      reviewCheckStatus: allProductsReviewed
        ? "REVIEWED"
        : (dbData?.reviewCheckStatus ?? "PENDING"),
      requestType: dbData?.requestType ?? "",
      reviews: dbData?.reviews ?? [],
    };
  });
}
