import { getProduct } from "../utils/getProduct.js";
import { toProductGid } from "../utils/shopifyGid.js";

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
        const orderNumber = formattedOrder?.orderId?.split("#")[1] ?? "";
        const productUrl =
          product?.onlineStoreUrl ??
          (productHandle
            ? `https://${shop}/products/${productHandle}?isOpen=true&orderId=${orderNumber}`
            : null);

        return {
          ...item,
          productHandle,
          handle: productHandle,
          image: product?.featuredImage?.url ?? item.image ?? null,
          url: productUrl ?? item.url ?? null,
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
