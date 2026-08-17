import prisma from "../db.server";
import { authenticate } from "../shopify.server";
import { updateProductReviewMetafields } from "../utils/updateProductReviewMetafield";
import { deleteFile } from "../lib/s3/deleteFile";

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

    // Delete S3 attachments before cascading DB delete removes the records
    const attachments = await prisma.attachment.findMany({
      where: { review: { storeId } },
      select: { url: true },
    });

    const attachmentUrls = attachments.map((a) => a.url).filter(Boolean);

    if (attachmentUrls.length > 0) {
      console.log(
        `[shop_redact] Deleting ${attachmentUrls.length} S3 attachments for store ${storeId}`,
      );
      await Promise.allSettled(
        attachmentUrls.map(async (url) => {
          try {
            await deleteFile(url);
          } catch (error) {
            console.error(
              `[shop_redact] Failed to delete S3 file ${url}:`,
              error?.message || error,
            );
          }
        }),
      );
    }

    await prisma.store.deleteMany({ where: { storeGID: storeId } });
    // await prisma.session.deleteMany({ where: { shop: payload.shop_domain } });

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
    console.log("OK", { status: 200 });
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[shop_redact] error:", error);
    return new Response("Unauthorized", { status: 401 });
  }
};
