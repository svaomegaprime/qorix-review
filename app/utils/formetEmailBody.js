export function formetEmailBody(message, firstName, storeName, productName) {
  return message
    .replace(/{{first_name}}/g, firstName)
    .replace(/{{store_name}}/g, storeName)
    .replace(/{{product_name}}/g, productName);
}
