import prisma from "../db.server";
import { authenticate, unauthenticated } from "../shopify.server";
import { updateProductReviewMetafields } from "../utils/updateProductReviewMetafield";

export const action = async ({ request }) => {
  try {
    const { payload, shop: webhookShop, admin: webhookAdmin } = await authenticate.webhook(request);
    const shop = webhookShop || payload.shop_domain;
    const storeId = `gid://shopify/Shop/${payload.shop_id}`;

    const productIds = (await prisma.review.findMany({
      where: { storeId },
      select: { productId: true },
      distinct: ["productId"],
    }))
      .map((review) => review.productId)
      .filter(Boolean);

    await prisma.store.deleteMany({ where: { storeGID: storeId } });
    await prisma.session.deleteMany({ where: { shop: payload.shop_domain } });

    const admin =
      webhookAdmin ||
      (await unauthenticated
        .admin(shop)
        .then(({ admin }) => admin)
        .catch((error) => {
          console.warn("[shop_redact] Could not get admin client:", error?.message || error);
          return null;
        }));

    if (admin) {
      await Promise.all(
        productIds.map(async (productId) => {
          try {
            await updateProductReviewMetafields(admin, productId, storeId);
          } catch (error) {
            console.error(
              `[shop_redact] Failed to update metafields for product ${productId}:`,
              error?.message || error
            );
          }
        })
      );
    }

    return new Response("OK");
  } catch (error) {
    console.error("[shop_redact] error:", error);
    return new Response("Unauthorized", { status: 401 });
  }
};
