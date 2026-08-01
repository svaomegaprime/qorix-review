
export async function getMainThemeId(admin) {
  if (!admin) return null;
  try {
    const response = await admin.graphql(`
      #graphql
      query GetMainThemeId {
        themes(first: 1, roles: [MAIN]) {
          edges {
            node {
              id
            }
          }
        }
      }
    `);

    const json = await response.json();
    return json?.data?.themes?.edges?.[0]?.node?.id || null;
  } catch (error) {
    const msg = error?.message || String(error);
    if (!msg.includes("Access denied for themes field") && !msg.includes("read_themes")) {
      console.error("[AppEmbed Service] Failed to get main theme ID:", msg);
    }
    return null;
  }
}

/**
 * Removes comments and control characters from JSON string before parsing.
 * 
 * @param {string} jsonString - Raw file content
 * @returns {string} Sanitized JSON string
 */
function cleanJsonString(jsonString) {
  if (!jsonString) return "{}";
  return jsonString.replace(/\/\*[\s\S]*?\*\/|(^|[^:\\])\/\/.*$/gm, "$1");
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
    const rawContent = json?.data?.theme?.files?.edges?.[0]?.node?.body?.content;
    if (!rawContent) return null;

    const cleanJson = cleanJsonString(rawContent);
    return JSON.parse(cleanJson);
  } catch (error) {
    const msg = error?.message || String(error);
    if (!msg.includes("Access denied for themes field") && !msg.includes("read_themes")) {
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
  const embedBlock = allBlocks.find((block) => {
    if (!block || typeof block?.type !== "string") return false;
    const typeLower = block.type.toLowerCase();
    return (
      typeLower.includes(`blocks/${appHandle}`) ||
      typeLower.includes(appHandle) ||
      typeLower.includes("qorix")
    );
  });

  if (!embedBlock) return null;
  return embedBlock.disabled ? "DISABLED" : "ENABLED";
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

  const themeId = await getMainThemeId(admin);
  if (!themeId) return false;

  const settings = await getThemeSettings(admin, themeId);
  if (!settings) return false;

  const status = findEmbedBlock(settings, appHandle);
  return status === "ENABLED";
}
