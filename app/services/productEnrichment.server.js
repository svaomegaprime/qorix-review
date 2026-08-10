import { getProduct } from "../utils/getProduct.js";
import { toProductGid } from "../utils/shopifyGid.js";

function getOrderNumber(orderId) {
  return String(orderId || "").replace(/^#/, "");
}

function buildReviewProductUrl(baseUrl, orderId) {
  if (!baseUrl) return null;

  try {
    const url = new URL(baseUrl);
    const orderNumber = getOrderNumber(orderId);

    url.searchParams.set("isOpen", "true");
    if (orderNumber) url.searchParams.set("orderId", orderNumber);

    return url.toString();
  } catch {
    return baseUrl;
  }
}

/**
 * @param {Record<string, any>} formattedOrder
 * @param {Record<string, any>} admin
 * @param {string} shop
 */
export async function enrichOrderProducts(formattedOrder, admin, shop) {
  const products = await Promise.all(
    (formattedOrder.products ?? []).map(async (item) => {
      const gid = toProductGid(item.productId);
      if (!gid) return item;

      try {
        const product = await getProduct(admin, gid);
        const productHandle =
          product?.handle ?? item.productHandle ?? item.handle ?? null;
        const productUrlBase =
          product?.onlineStoreUrl ??
          (productHandle
            ? `https://${shop}/products/${productHandle}`
            : item.url);
        const productUrl = buildReviewProductUrl(
          productUrlBase,
          formattedOrder?.orderId,
        );

        return {
          ...item,
          productHandle,
          handle: productHandle,
          image: product?.featuredImage?.url ?? item.image ?? null,
          url: productUrl ?? null,
        };
      } catch (error) {
        console.error("Failed to enrich order product", {
          productId: item.productId,
          error,
        });
        return item;
      }
    }),
  );

  return { ...formattedOrder, products };
}
