// utils/shopifySubscription.server.js
import { authenticate } from "../shopify.server";

export async function getShopifyActivePlan(request) {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;

  const response = await admin.graphql(`
    {
      appInstallation {
        activeSubscriptions {
          name
          status
        }
      }
    }
  `);

  const data = await response.json();

  const subs = data.data.appInstallation.activeSubscriptions;

  const active = subs.find((s) => s.status === "ACTIVE");

  const activePlan = active?.name
    ? active?.name?.toLowerCase().replace(/\s+/g, "-")
    : null;
  console.log("***", shop, "***", activePlan, "***", active?.status);
  return {
    shop,
    activePlan,
    activeStatus: active?.status || null,
  };
}
