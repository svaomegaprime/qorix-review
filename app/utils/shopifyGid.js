const PRODUCT_GID_PREFIX = "gid://shopify/Product/";

/**
 * @param {string | number | null | undefined} productId
 * @returns {string | null}
 */
export function toProductGid(productId) {
  if (productId === null || productId === undefined || productId === "") {
    return null;
  }

  const value = String(productId);
  return value.startsWith(PRODUCT_GID_PREFIX)
    ? value
    : `${PRODUCT_GID_PREFIX}${value}`;
}
