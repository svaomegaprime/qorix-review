import prisma from "../db.server";
import { authenticate } from "../shopify.server";
import { updateProductReviewMetafields } from "../utils/updateProductReviewMetafield";

export const action = async ({ request }) => {
  try {
    const {
      payload,
      shop: webhookShop,
      admin,
    } = await authenticate.webhook(request);
    const shop = webhookShop || payload.shop_domain;
    const storeId = `gid://shopify/Shop/${payload.shop_id}`;
    console.log("payload", payload);
    const productIds = (
      await prisma.review.findMany({
        where: { storeId },
        select: { productId: true },
        distinct: ["productId"],
      })
    )
      .map((review) => review.productId)
      .filter(Boolean);

    await prisma.store.deleteMany({ where: { storeGID: storeId } });
    await prisma.session.deleteMany({ where: { shop: payload.shop_domain } });

    if (admin) {
      await Promise.all(
        productIds.map(async (productId) => {
          try {
            await updateProductReviewMetafields(admin, productId, storeId);
          } catch (error) {
            console.error(
              `[shop_redact] Failed to update metafields for product ${productId}:`,
              error?.message || error,
            );
          }
        }),
      );
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[shop_redact] error:", error);
    return new Response("Unauthorized", { status: 401 });
  }
};
