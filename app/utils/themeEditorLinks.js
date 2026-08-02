/**
 * Utility functions for generating Shopify Theme Editor Deep Links for App Blocks and App Embeds.
 * 
 * Deep Link Spec:
 * - App Block: https://{shop}/admin/themes/current/editor?template={template}&addAppBlockId={apiKey}/{blockHandle}&target={target}
 * - App Embed: https://{shop}/admin/themes/current/editor?context=apps&activateAppId={apiKey}/{embedHandle}
 */

const DEFAULT_API_KEY = "1fd61c4448a3e740e2e1b9bc99b9db0d";

/**
 * Clean shop domain string by removing protocol or trailing slash if present
 * @param {string} shop 
 * @returns {string} Clean shop domain (e.g. "my-store.myshopify.com")
 */
export function sanitizeShopDomain(shop) {
  if (!shop) return "";
  return String(shop)
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "");
}

/**
 * Generates an App Block Deep Link URL for Shopify Theme Editor
 * 
 * @param {Object} params
 * @param {string} params.shop - Merchant shop domain (e.g. "my-store.myshopify.com")
 * @param {string} [params.apiKey] - Shopify App API Key (client_id)
 * @param {string} params.blockHandle - Block filename without .liquid (e.g. "quick_review", "trust_bar")
 * @param {string} [params.template="product"] - Shopify template ("product", "index", "cart", etc.)
 * @param {string} [params.target="newAppsSection"] - Placement target ("newAppsSection" or "mainSection")
 * @returns {string} Deep link URL or "#"
 */
export function getAppBlockDeepLink({
  shop,
  apiKey,
  blockHandle,
  template = "product",
  target = "newAppsSection",
}) {
  const cleanShop = sanitizeShopDomain(shop);
  const key = apiKey || DEFAULT_API_KEY;

  if (!cleanShop || !blockHandle) return "#";
  return `https://${cleanShop}/admin/themes/current/editor?template=${template}&addAppBlockId=${key}/${blockHandle}&target=${target}`;
}

/**
 * Generates an App Embed Deep Link URL for Shopify Theme Editor
 * 
 * @param {Object} params
 * @param {string} params.shop - Merchant shop domain (e.g. "my-store.myshopify.com")
 * @param {string} [params.apiKey] - Shopify App API Key (client_id)
 * @param {string} [params.embedHandle="app_embed"] - App embed block handle
 * @returns {string} Deep link URL or "#"
 */
export function getAppEmbedDeepLink({
  shop,
  apiKey,
  embedHandle = "app_embed",
}) {
  const cleanShop = sanitizeShopDomain(shop);
  const key = apiKey || DEFAULT_API_KEY;

  if (!cleanShop) return "#";
  return `https://${cleanShop}/admin/themes/current/editor?context=apps&activateAppId=${key}/${embedHandle}`;
}

/**
 * Safely opens the theme editor deep link in a new browser tab/window
 * 
 * @param {string} url - Deep link URL
 */
export function openThemeEditor(url) {
  if (!url || url === "#") return;
  window.open(url, "_blank", "noopener,noreferrer");
}
