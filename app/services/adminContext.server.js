import { authenticate } from "../shopify.server.js";
import { getStoreData } from "../utils/getStoreData.js";

/**
 * Authenticate an embedded admin request and resolve its Shopify store once.
 * @param {Request} request
 */
export async function requireAdminContext(request) {
  const { admin, session } = await authenticate.admin(request);
  const storeData = await getStoreData(admin);

  if (!storeData?.id) {
    throw new Error("Unable to resolve the authenticated Shopify store");
  }

  return { admin, session, storeData, storeId: storeData.id };
}
