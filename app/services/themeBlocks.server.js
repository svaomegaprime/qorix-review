/* eslint-disable no-control-regex */
/**
 * Server-side service to check installed widget app blocks and app embed status
 * across theme templates and settings in Shopify.
 */

import { getMainThemeId } from "./appEmbed.server.js";

/**
 * Safely parses theme settings/template JSON string.
 * 
 * @param {string} jsonString - Raw JSON string
 * @returns {Object|null} Parsed JSON object or null
 */
function parseThemeJsonContent(jsonString) {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch {
    try {
      const sanitized = jsonString
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
      return JSON.parse(sanitized);
    } catch {
      return null;
    }
  }
}

/**
 * Recursively scans object/tree to collect all block nodes with a type property.
 * 
 * @param {Object} obj - Target node
 * @param {Array} found - Accumulator array
 * @returns {Array} List of block objects
 */
function findAllBlocks(obj, found = []) {
  if (!obj || typeof obj !== "object") return found;

  if (typeof obj.type === "string") {
    found.push(obj);
  }

  for (const key in obj) {
    if (obj[key] && typeof obj[key] === "object") {
      findAllBlocks(obj[key], found);
    }
  }

  return found;
}

/**
 * Fetches multiple theme configuration & template files from Shopify Admin API.
 * 
 * @param {Object} admin - Shopify Admin API context
 * @param {string} themeId - Main Theme GID
 * @returns {Promise<Array<Object>>} List of parsed theme JSON objects
 */
export async function getThemeFilesData(admin, themeId) {
  if (!admin || !themeId) return [];

  const filenames = [
    "config/settings_data.json",
    "templates/product.json",
    "templates/product.context.json",
    "templates/index.json",
    "templates/cart.json",
    "templates/collection.json",
    "templates/page.json",
  ];

  try {
    const response = await admin.graphql(
      `#graphql
      query GetThemeFiles($id: ID!, $filenames: [String!]!) {
        theme(id: $id) {
          files(filenames: $filenames) {
            edges {
              node {
                filename
                body {
                  ... on OnlineStoreThemeFileBodyText {
                    content
                  }
                }
              }
            }
          }
        }
      }`,
      { variables: { id: themeId, filenames } }
    );

    const json = await response.json();
    const edges = json?.data?.theme?.files?.edges || [];

    const parsedFiles = [];
    for (const edge of edges) {
      const rawContent = edge?.node?.body?.content;
      if (rawContent) {
        const parsed = parseThemeJsonContent(rawContent);
        if (parsed) {
          parsedFiles.push(parsed);
        }
      }
    }

    return parsedFiles;
  } catch (error) {
    const msg = error?.message || String(error);
    if (
      !msg.includes("Access denied for themes field") &&
      !msg.includes("read_themes")
    ) {
      console.error("[ThemeBlocks Service] Failed to fetch theme files:", msg);
    }
    return [];
  }
}

/**
 * Main function to check which of all 6 widgets are installed/enabled in the merchant's live theme.
 * Scans both theme settings (for app embeds) and theme templates (for app blocks).
 * 
 * @param {Object} admin - Shopify Admin API context
 * @returns {Promise<string[]>} List of installed widget IDs
 */
export async function getInstalledWidgets(admin) {
  if (!admin) return [];
  try {
    const themeId = await getMainThemeId(admin);
    if (!themeId) return [];

    const themeFiles = await getThemeFilesData(admin, themeId);
    if (themeFiles.length === 0) return [];

    const allBlocks = [];
    for (const fileObj of themeFiles) {
      findAllBlocks(fileObj, allBlocks);
    }

    const WIDGET_MAPPINGS = [
      { id: "quick_review", handles: ["quick_review", "quick-review"] },
      { id: "trust_bar", handles: ["trust_bar", "trust-bar"] },
      { id: "review_reel", handles: ["qorix-review-reel-widget", "review_reel", "review-reel"] },
      { id: "video_stack", handles: ["video-stack-widget", "video_stack", "video-stack"] },
      { id: "quote_loop", handles: ["quoteloop", "quote_loop", "quote-loop"] },
      { id: "review_hub", handles: ["review_hub", "review-hub"] },
    ];

    const installedWidgetIds = [];

    for (const item of WIDGET_MAPPINGS) {
      const foundBlock = allBlocks.find((block) => {
        if (!block || typeof block?.type !== "string") return false;
        const typeLower = block.type.toLowerCase();
        if (typeLower.includes("qorix-popup") || typeLower.includes("qorix_popup")) {
          return false;
        }
        return item.handles.some((handle) => typeLower.includes(handle.toLowerCase()));
      });

      if (foundBlock && foundBlock.disabled !== true) {
        installedWidgetIds.push(item.id);
      }
    }

    return installedWidgetIds;
  } catch (error) {
    console.error("[ThemeBlocks Service] Error checking installed widgets:", error);
    return [];
  }
}
