import { sendEmail } from "../../utils/sendEmail";
import prisma from "../../db.server";
import { setAppMetafield } from "../../utils/appMetafields.server";
import { unauthenticated } from "../../shopify.server";
import { markOrderProductReviewed } from "../../services/orders.server.js";
import { updateProductReviewDefineMetafields } from "../../utils/updateProductReviewDefineMetafields";

async function sendQueuedEmail(jobData) {
  const emailData = jobData?.emailData || jobData;
  const payload = jobData?.payload;
  try {
    await sendEmail(emailData);
    console.log("email sent successfully");

    if (payload?.storeId && payload?.orderId) {
      await prisma.order.updateMany({
        where: {
          storeId: payload.storeId,
          orderId: payload.orderId,
          reviewCheckStatus: { not: "REVIEWED" },
        },
        data: {
          reviewCheckStatus: "SENT",
        },
      });
      console.log("order status updated to SENT");
    }
    return;
  } catch (error) {
    console.log(error);
    if (payload?.storeId && payload?.orderId) {
      await prisma.order.updateMany({
        where: {
          storeId: payload.storeId,
          orderId: payload.orderId,
          reviewCheckStatus: { not: "REVIEWED" },
        },
        data: {
          reviewCheckStatus: "FAILED",
        },
      });
      console.log("order status updated to FAILED");
    }
    return;
  }
}

async function clientConfirmationEmailSend(jobData) {
  const emailData = jobData?.emailData || jobData;
  try {
    await sendEmail(emailData);
    console.log("email sent successfully");
    return;
  } catch (error) {
    console.log("email sent not successfully");
    return;
  }
}
async function adminConfirmationEmailSend(jobData) {
  const emailData = jobData?.emailData || jobData;
  try {
    await sendEmail(emailData);
    console.log("email sent successfully");
    return;
  } catch (error) {
    console.log("email sent not successfully");
    return;
  }
}

async function updateDefaultSettings(jobData) {
  try {
    const { admin } = await unauthenticated.admin(jobData.shop);
    // all data is set in the database for the first time and update if already exists
    const quickReviewWidget = await prisma.quickReviewWidget.upsert(
      jobData.quickReviewWidget,
    );
    await setAppMetafield(admin, "quick_review", quickReviewWidget);
    // review hub
    const reviewHubWidget = await prisma.reviewHubWidget.upsert(
      jobData.reviewHubWidget,
    );
    await setAppMetafield(admin, "review_hub", reviewHubWidget);
    // Quote Loop Widget data set in the database for the first time and update if already exists
    const quoteLoopWidget = await prisma.quoteLoopWidget.upsert(
      jobData.quoteLoopWidget,
    );
    await setAppMetafield(admin, "quote_loop", quoteLoopWidget);
    // Video Stack Widget data set in the database for the first time and update if already exists
    const videoStackWidget = await prisma.videoStackSettings.upsert(
      jobData.videoStackSettings,
    );
    await setAppMetafield(admin, "video_stack", videoStackWidget);
    // review reel
    const reviewReelWidget = await prisma.reviewReelSettings.upsert(
      jobData.reviewReelSettings,
    );

    await setAppMetafield(admin, "review_reel", reviewReelWidget);

    // trustBarWidget
    const trustBarWidget = await prisma.trustBarWidget.upsert(
      jobData.trustBarWidget,
    );

    await setAppMetafield(admin, "trust_bar", trustBarWidget);
  } catch (error) {
    console.log(error);
  }
}

async function postReviewOrderMetafieldSync(jobData) {
  const {
    shop,
    storeId,
    productId,
    reviewerEmail,
    reviewId,
    orderId,
  } = jobData;

  try {
    const { admin } = await unauthenticated.admin(shop);

    // 1. Mark the order line-item as reviewed (pure DB)
    if (orderId) {
      try {
        await markOrderProductReviewed({
          storeId,
          orderId,
          reviewerEmail: String(reviewerEmail),
          productId: String(productId),
          reviewId,
        });
      } catch (err) {
        console.error("[WORKER::markOrderProductReviewed]", err);
      }
    }

    // 2. Update product metafields (rating + rating_count)
    try {
      await updateProductReviewDefineMetafields(admin, productId, storeId);
    } catch (err) {
      console.error("[WORKER::updateProductReviewDefineMetafields]", err);
    }
  } catch (error) {
    console.error("[WORKER::postReviewOrderMetafieldSync] fatal", error);
  }
}

const bullmqService = {
  scheduleEmailSend: sendQueuedEmail,
  reminderEmailSend: sendQueuedEmail,
  clientConfirmationEmailSend: clientConfirmationEmailSend,
  adminConfirmationEmailSend: adminConfirmationEmailSend,
  updateDefaultSettings: updateDefaultSettings,
  postReviewOrderMetafieldSync: postReviewOrderMetafieldSync,
};

export default bullmqService;
