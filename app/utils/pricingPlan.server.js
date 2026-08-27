// utils/shopifySubscription.server.js
import { authenticate } from "../shopify.server";

export async function getShopifyActivePlan(request, adminContext) {
  let admin = adminContext;
  let shop = null;

  if (!admin) {
    const auth = await authenticate.admin(request);
    admin = auth.admin;
    shop = auth.session?.shop || null;
  }

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

  const subs = data?.data?.appInstallation?.activeSubscriptions || [];

  const active = subs.find((s) => s.status === "ACTIVE");

  const activePlan = active?.name
    ? active.name.toLowerCase().replace(/\s+/g, "-")
    : null;
  console.log({
    shop,
    activePlan,
    activeStatus: active?.status || null,
  });
  return {
    shop,
    activePlan,
    activeStatus: active?.status || null,
  };
}
