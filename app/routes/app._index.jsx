import { useFetcher, useLoaderData, useNavigation } from "react-router";
import { Text } from "@shopify/polaris";
import SetupGuide from "../components/pages/dashboard/SetupGuide";
import ReviewBreakdown from "../components/pages/dashboard/ReviewBreakdown";
import Loader from "../components/essentials/Loader";
import AppEmbedStatus from "../components/essentials/AppEmbedStatus";
import Analytics from "../components/essentials/Analytics";
import FAQ from "../components/pages/dashboard/FAQ";
import Help from "../components/pages/dashboard/Help";
import prisma from "../db.server";
import { requireAdminContext } from "../services/adminContext.server.js";
import { adminErrorResponse } from "../utils/adminError.server";
import {
  deleteReviewWithAttachments,
  updateReviewStatus,
} from "../services/reviews.server.js";
import { sendEmail } from "../utils/sendEmail";
import { buildReplyEmailData } from "../services/emailPayload.server.js";

import { checkAppEmbedEnabled } from "../services/appEmbed.server.js";

export async function loader({ request }) {
  try {
    const { admin, session, storeData } = await requireAdminContext(request);
    const reviews = await prisma.review.findMany({
      where: {
        storeId: storeData.id,
      },
      include: {
        attachments: true,
        reply: true,
      },
    });
    const pendingOrders = await prisma.order.findMany({
      where: {
        storeId: storeData.id,
        reviewCheckStatus: "SENT",
      },
    });

    const isAppEnabled = await checkAppEmbedEnabled(admin);

    const storeSettings = await prisma.storeSettings.findFirst({
      where: { storeId: storeData.id },
      include: { emailSettings: true },
    });

    const emailSettings = storeSettings?.emailSettings;
    const isEmailConfigured = Boolean(
      String(emailSettings?.smtpUser || "").trim() &&
      String(emailSettings?.smtpPassword || "").trim() &&
      emailSettings?.smtpPort &&
      String(emailSettings?.smtpHost || "").trim()
    );

    return {
      reviews: reviews,
      pendingOrders,
      shop: session?.shop || "",
      // eslint-disable-next-line no-undef
      apiKey: process.env.SHOPIFY_API_KEY || "1fd61c4448a3e740e2e1b9bc99b9db0d",
      isAppEnabled,
      isEmailConfigured,
    };
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function action({ request }) {
  try {
    const { storeData } = await requireAdminContext(request);
    const method = request.method.toUpperCase();

    switch (method) {
      case "PATCH": {
        const formData = await request.formData();
        const reviewId = formData.get("reviewId");
        const status = formData.get("status");

        if (reviewId && status) {
          await updateReviewStatus({
            reviewId: String(reviewId),
            status: String(status),
            storeId: storeData.id,
          });
        }
        break;
      }
      case "DELETE": {
        const formData = await request.formData();
        const reviewId = formData.get("reviewId");
        if (reviewId) {
          await deleteReviewWithAttachments({
            reviewId: String(reviewId),
            storeId: storeData.id,
          });
        }
        break;
      }
      case "PUT": {
        const formData = await request.formData();
        const reviewId = String(formData.get("reviewId") || "").trim();
        const body = String(formData.get("body") || "").trim();

        if (reviewId && body) {
          const review = await prisma.review.findFirst({
            where: {
              id: reviewId,
              storeId: storeData.id,
            },
            include: {
              reply: true,
            },
          });

          if (!review) {
            break;
          }

          await prisma.reply.upsert({
            where: { reviewId },
            update: { body },
            create: { reviewId, body },
          });

          const updatedReview = await prisma.review.findUnique({
            where: { id: reviewId },
            include: {
              reply: true,
            },
          });

          const storeSettings = await prisma.storeSettings.findUnique({
            where: { storeId: storeData.id },
            include: {
              emailSettings: true,
              publishingModeration: true,
              brandingSettings: true,
            },
          });

          if (updatedReview?.reviewerEmail) {
            const buttonUrl =
              updatedReview.productHandle && storeData?.storeURL
                ? `https://${storeData.storeURL}/products/${updatedReview.productHandle}`
                : "#";

            const replyEmailData = buildReplyEmailData({
              review: updatedReview,
              storeSettings,
              storeData,
              buttonUrl,
            });

            await sendEmail(replyEmailData);
          }
        }
        break;
      }
      default:
        return new Response(null, { status: 405 });
    }

    return { success: true };
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export default function Index() {
  const fetcher = useFetcher();
  const { reviews, pendingOrders, shop = "", apiKey = "", isAppEnabled = false, isEmailConfigured = false } = useLoaderData();
  // Start----Default CSR loading state checking for navigation
  const navigation = useNavigation();
  if (navigation.state === "loading") {
    return <Loader />;
  }

  // Start----Handle status toggle
  const handleStatusUpdate = (reviewId, state) => {
    fetcher.submit(
      {
        reviewId,
        status: state,
      },
      { method: "PATCH" },
    );
  };
  // End----Handle status toggle

  // Start----Handle review delete
  const handleReviewDelete = (reviewId, attachments) => {
    fetcher.submit(
      {
        reviewId,
        attachments: attachments ? JSON.stringify(attachments) : "[]",
      },
      { method: "DELETE" },
    );
  };
  // End----Handle review delete
  // Start----Handle review reply
  const handleReviewReply = (reviewId, body) => {
    fetcher.submit(
      {
        reviewId,
        body,
      },
      { method: "PUT" },
    );
  };
  // End----Handle review delete
  // End----Default CSR loading state checking for navigation
  return (
    <s-page>
      <s-stack
        direction="inline"
        gap="base"
        justifyContent="space-between"
        alignItems="center"
        paddingBlockEnd="base"
      >
        <Text as="h2">Welcome to Qorix review 👋</Text>
        <s-grid gridTemplateColumns="auto auto">
          {/* <s-button variant="secondary" icon="plus">
            Request reviews
          </s-button> */}
          <s-button
            variant="primary"
            icon="store"
            href={shop ? `https://${shop}` : undefined}
            target="_blank"
          >
            View store
          </s-button>
        </s-grid>
      </s-stack>

      <SetupGuide shop={shop} apiKey={apiKey} isAppEnabled={isAppEnabled} isEmailConfigured={isEmailConfigured} />
      <AppEmbedStatus shop={shop} apiKey={apiKey} isAppEnabled={isAppEnabled} />
      <Analytics reviews={reviews} pendingOrders={pendingOrders} />
      <ReviewBreakdown
        reviews={reviews}
        handleStatusUpdate={handleStatusUpdate}
        handleReviewDelete={handleReviewDelete}
        handleReviewReply={handleReviewReply}
        isAppEnabled={isAppEnabled}
      />
      <s-stack paddingBlockStart="base">
        <FAQ />
      </s-stack>
      <s-stack paddingBlockStart="base">
        <Help />
      </s-stack>
      <s-stack alignItems="center" paddingBlockStart="large">
        <s-paragraph color="subdued">
          Powered by Qorix Shopify - All rights reserved
        </s-paragraph>
      </s-stack>
    </s-page>
  );
}
