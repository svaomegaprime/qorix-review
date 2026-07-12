/**
 * Replace the supported merchant-authored email placeholders.
 * @param {string | null | undefined} message
 * @param {string | null | undefined} firstName
 * @param {string | null | undefined} storeName
 * @param {string | null | undefined} productName
 */
export function formatEmailBody(message, firstName, storeName, productName) {
  return String(message ?? "")
    .replace(/{{first_name}}/g, firstName ?? "")
    .replace(/{{store_name}}/g, storeName ?? "")
    .replace(/{{product_name}}/g, productName ?? "");
}
