/**
 * Server-side service to check whether an App Embed block or App Blocks are enabled on the published main theme.
 */

/**
 * Retrieves the MAIN (active/published) theme ID from Shopify Admin GraphQL API.
 * 
 * @param {Object} admin - Shopify Admin API context
 * @returns {Promise<string|null>} Main theme ID GID or null
 */
export async function getMainThemeId(admin) {
  if (!admin) return null;
  try {
    const response = await admin.graphql(`
      #graphql
      query GetThemes {
        themes(first: 10) {
          nodes {
            id
            role
          }
        }
      }
    `);

    const json = await response.json();
    const nodes = json?.data?.themes?.nodes || [];
    if (nodes.length === 0) return null;

    const mainTheme =
      nodes.find((t) => String(t.role).toUpperCase() === "MAIN") || nodes[0];
    return mainTheme?.id || null;
  } catch (error) {
    const msg = error?.message || String(error);
    if (
      !msg.includes("Access denied for themes field") &&
      !msg.includes("read_themes")
    ) {
      console.error("[AppEmbed Service] Failed to get main theme ID:", msg);
    }
    return null;
  }
}

/**
 * Safely parses theme settings/template JSON string.
 * Tries direct JSON parsing first to preserve URLs with "https://", 
 * falling back to comment-stripping if needed.
 * 
 * @param {string} jsonString - Raw JSON string
 * @returns {Object|null} Parsed JSON object or null
 */
function parseThemeSettings(jsonString) {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch {
    try {
      const sanitized = jsonString
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
      return JSON.parse(sanitized);
    } catch (err) {
      console.error("[AppEmbed Service] Settings JSON parse error:", err?.message);
      return null;
    }
  }
}

/**
 * Fetches and parses config/settings_data.json for a given theme ID.
 * 
 * @param {Object} admin - Shopify Admin API context
 * @param {string} themeId - Theme GID
 * @returns {Promise<Object|null>} Parsed settings object or null
 */
async function getThemeSettings(admin, themeId) {
  if (!admin || !themeId) return null;
  try {
    const response = await admin.graphql(
      `#graphql
      query GetThemeSettings($id: ID!) {
        theme(id: $id) {
          files(filenames: ["config/settings_data.json"]) {
            edges {
              node {
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
      { variables: { id: themeId } }
    );

    const json = await response.json();
    const rawContent =
      json?.data?.theme?.files?.edges?.[0]?.node?.body?.content;
    if (!rawContent) return null;

    return parseThemeSettings(rawContent);
  } catch (error) {
    const msg = error?.message || String(error);
    if (
      !msg.includes("Access denied for themes field") &&
      !msg.includes("read_themes")
    ) {
      console.error("[AppEmbed Service] Failed to fetch theme settings:", msg);
    }
    return null;
  }
}

/**
 * Recursively scans theme settings object to collect all block items.
 * 
 * @param {Object} obj - Target object/node
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
 * Finds matching app embed block and checks its status.
 * 
 * @param {Object} settings - Parsed settings_data.json
 * @param {string} [appHandle="app_embed"] - Handle/name of app embed block
 * @returns {"ENABLED"|"DISABLED"|null} Status of embed block
 */
function findEmbedBlock(settings, appHandle = "app_embed") {
  if (!settings) return null;

  const allBlocks = findAllBlocks(settings);

  const matchingBlocks = allBlocks.filter((block) => {
    if (!block || typeof block?.type !== "string") return false;
    const typeLower = block.type.toLowerCase();
    
    if (typeLower.includes("qorix-popup") || typeLower.includes("qorix_popup")) {
      return false;
    }

    return (
      typeLower.includes("qorix-review") ||
      typeLower.includes("qorix_review") ||
      typeLower.includes(`blocks/${appHandle}`) ||
      typeLower.includes(appHandle.toLowerCase()) ||
      typeLower.includes("app_embed") ||
      typeLower.includes("app-embed")
    );
  });

  if (matchingBlocks.length === 0) {
    return null;
  }

  const enabledBlock = matchingBlocks.find((b) => b.disabled !== true);
  return enabledBlock ? "ENABLED" : "DISABLED";
}

/**
 * Main server-side function to check if app_embed is enabled on the merchant's live theme.
 * 
 * @param {Object} admin - Shopify Admin API context
 * @param {string} [appHandle="app_embed"] - App embed block handle
 * @returns {Promise<boolean>} True if enabled, false otherwise
 */
export async function checkAppEmbedEnabled(admin, appHandle = "app_embed") {
  if (!admin) return false;
  try {
    const themeId = await getMainThemeId(admin);
    if (!themeId) return false;

    const settings = await getThemeSettings(admin, themeId);
    if (!settings) return false;

    const status = findEmbedBlock(settings, appHandle);
    return status === "ENABLED";
  } catch (error) {
    console.error("[AppEmbed Service] Error checking app embed:", error);
    return false;
  }
}

import { getInstalledWidgets } from "./themeBlocks.server.js";

/**
 * Checks which of all 6 widgets are currently installed/enabled in the merchant's live theme.
 * Scans both theme settings (for app embeds) and theme templates (for app blocks).
 * 
 * @param {Object} admin - Shopify Admin API context
 * @returns {Promise<string[]>} Array of installed widget IDs
 */
export async function getWidgetsInstalledStatus(admin) {
  return getInstalledWidgets(admin);
}

