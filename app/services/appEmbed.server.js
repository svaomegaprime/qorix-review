/**
 * Server-side helper to check if the App Embed block (app_embed) is enabled on the live main theme.
 * 
 * @param {Object} admin - Shopify Admin API context from authenticate.admin(request)
 * @returns {Promise<boolean>} True if app_embed block is enabled in main theme settings_data.json
 */
export async function checkAppEmbedEnabled(admin) {
  if (!admin) return false;

  try {
    const response = await admin.graphql(
      `#graphql
      query CheckAppEmbed {
        themes(roles: [MAIN], first: 1) {
          nodes {
            id
            name
            role
            files(filenames: ["config/settings_data.json"], first: 1) {
              nodes {
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
      }`
    );

    const json = await response.json();

    if (json?.errors && Array.isArray(json.errors) && json.errors.length > 0) {
      console.warn("GraphQL notice checking app embed status:", json.errors[0]?.message);
      return false;
    }

    const mainTheme = json?.data?.themes?.nodes?.[0];
    const settingsFile = mainTheme?.files?.nodes?.[0];
    const contentText = settingsFile?.body?.content;

    if (!contentText) {
      return false;
    }

    const settingsData = JSON.parse(contentText);

    // In settings_data.json, blocks can be under current.blocks or blocks or current.current.blocks
    const currentSettings = settingsData?.current || settingsData;
    const blocks = currentSettings?.blocks || settingsData?.blocks || {};

    // Search through all theme blocks for our app_embed block type
    for (const blockId in blocks) {
      const block = blocks[blockId];
      if (typeof block?.type === "string" && block.type.includes("app_embed")) {
        // If disabled key is not explicitly true, it is enabled!
        if (block.disabled !== true) {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking app embed status:", error?.message || error);
    return false;
  }
}
