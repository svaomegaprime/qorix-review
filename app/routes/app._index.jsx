import { useFetcher, useLoaderData, useNavigation } from "react-router";
import { Text } from "@shopify/polaris";
import SetupGuide from "../components/pages/dashboard/SetupGuide";
import ReviewBreakdown from "../components/pages/dashboard/ReviewBreakdown";
import Loader from "../components/essentials/Loader";
import AppEmbedStatus from "../components/essentials/AppEmbedStatus";
import Analytics from "../components/essentials/Analytics";
import FAQ from "../components/pages/dashboard/FAQ";
import Help from "../components/pages/dashboard/Help";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { getStoreData } from "../utils/getStoreData";
import { adminErrorResponse } from "../utils/adminError.server";
import { deleteFile } from "../lib/s3/deleteFile";
import { sendEmail } from "../utils/sendEmail";
import { getRelativeTime } from "../utils/getRelativeTime";
import { formetEmailBody } from "../utils/formetEmailBody";

export async function loader({ request }) {
  try {
    const { admin } = await authenticate.admin(request);
    const storeData = await getStoreData(admin);
    const reviews = await prisma.review.findMany({
      where: {
        storeId: storeData.id,
      },
      include: {
        attachments: true,
        reply: true,
      },
      take: 3,
    });
    const pendingOrders = await prisma.order.findMany({
      where: {
        storeId: storeData.id,
        reviewCheckStatus: "SENT",
      },
    });

    return {
      reviews: reviews,
      pendingOrders,
    };
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function action({ request }) {
  try {
    const { admin } = await authenticate.admin(request);
    const storeData = await getStoreData(admin);
    const method = request.method.toUpperCase();

    switch (method) {
      case "PATCH": {
        const formData = await request.formData();
        const reviewId = formData.get("reviewId");
        const status = formData.get("status");

        if (reviewId && status) {
          await prisma.review.update({
            where: { id: reviewId },
            data: { status: status },
          });
        }
        break;
      }
      case "DELETE": {
        const formData = await request.formData();
        const reviewId = formData.get("reviewId");
        const attachmentsRaw = formData.get("attachments");

        if (attachmentsRaw) {
          try {
            const attachments = JSON.parse(attachmentsRaw);
            console.log(attachments);

            if (Array.isArray(attachments) && attachments.length > 0) {
              for (const attachment of attachments) {
                if (attachment?.url) {
                  await deleteFile(attachment.url);
                }
              }
            }
          } catch (error) {
            console.error("Failed to delete attachments:", error);
          }
        }

        if (reviewId) {
          await prisma.review.delete({
            where: { id: reviewId },
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
            const productTitle = updatedReview.productTitle ?? "";
            const buttonUrl =
              updatedReview.productHandle && storeData?.storeURL
                ? `https://${storeData.storeURL}/products/${updatedReview.productHandle}`
                : "#";

            const replyEmailData = {
              to: updatedReview.reviewerEmail,
              from: storeSettings?.emailSettings?.smtpUser,
              replyTo: storeSettings?.brandingSettings?.storeReplyToEmail,
              templateName: "ReplyEmail",
              subject: storeSettings?.emailSettings?.replyEmailSubjectLine,
              smtpConfig: {
                smtpHost: storeSettings?.emailSettings?.smtpHost,
                smtpPort: storeSettings?.emailSettings?.smtpPort,
                smtpUser: storeSettings?.emailSettings?.smtpUser,
                smtpPassword: storeSettings?.emailSettings?.smtpPassword,
              },
              templateData: {
                name: updatedReview.reviewerName,
                storeTagline: storeSettings?.brandingSettings?.storeTagline,
                timeAgo: getRelativeTime(updatedReview.createdAt),
                products: productTitle ? [{ title: productTitle }] : [],
                storeName:
                  storeSettings?.brandingSettings?.storeDisplayName ??
                  storeData.name,
                buttonUrl,
                replyEmailBody: formetEmailBody(
                  storeSettings?.emailSettings?.replyEmailBody ?? "",
                  updatedReview.reviewerName ?? "",
                  storeSettings?.brandingSettings?.storeDisplayName ??
                    storeData.name ??
                    "",
                  productTitle,
                ),
                replyEmailButton:
                  storeSettings?.emailSettings?.replyEmailButton,
                review: updatedReview.body,
                rating: updatedReview.rating,
                reply: updatedReview.reply?.body,
                replyFrom:
                  storeSettings?.brandingSettings?.storeDisplayName ??
                  storeData.name,
                storeFooterText:
                  storeSettings?.brandingSettings?.emailFooterText ?? "",
                storeFooterLinkText:
                  storeSettings?.brandingSettings?.emailFooterLinkText ?? "",
                isShowFooterBadge:
                  storeSettings?.brandingSettings?.isShowFooterBadge,
                storeLogo: storeSettings?.brandingSettings?.storeLogo,
                storeLogoPosition:
                  storeSettings?.brandingSettings?.storeLogoPosition,
                emailPrimaryButtonColor:
                  storeSettings?.brandingSettings?.emailPrimaryButtonColor,
                emailButtonTextColor:
                  storeSettings?.brandingSettings?.emailButtonTextColor,
                emailBackgroundColor:
                  storeSettings?.brandingSettings?.emailBackgroundColor,
                emailHeadingColor:
                  storeSettings?.brandingSettings?.emailHeadingColor,
                emailBodyTextColor:
                  storeSettings?.brandingSettings?.emailBodyTextColor,
                emailAccentBorderColor:
                  storeSettings?.brandingSettings?.emailAccentBorderColor,
              },
            };

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
  // Start----Default CSR loading state checking for navigation
  const navigation = useNavigation();
  if (navigation.state === "loading") {
    return <Loader />;
  }

  const { reviews, pendingOrders } = useLoaderData();
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
        <s-grid gridTemplateColumns="auto auto" gap="base">
          <s-button variant="secondary" icon="plus">
            Request reviews
          </s-button>
          <s-button variant="primary" icon="store">
            View store
          </s-button>
        </s-grid>
      </s-stack>

      <SetupGuide />
      <AppEmbedStatus isAppEnabled={false} />
      <Analytics reviews={reviews} pendingOrders={pendingOrders} />
      <ReviewBreakdown
        reviews={reviews}
        handleStatusUpdate={handleStatusUpdate}
        handleReviewDelete={handleReviewDelete}
        handleReviewReply={handleReviewReply}
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
