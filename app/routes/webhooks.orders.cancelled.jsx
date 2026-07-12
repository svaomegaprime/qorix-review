import crypto from "crypto";
import { authenticate, unauthenticated } from "../shopify.server";
import prisma from "../db.server";
import { getStoreData } from "../utils/getStoreData";
import {
  addJobInQueue,
  reviewQueue,
  removeJobInQueue,
} from "../lib/bullmq/bullmq.queue";
import { getProduct } from "../utils/getProduct";

export const action = async ({ request }) => {
  const { topic, shop, payload } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);

  if (topic === "ORDERS_CANCELLED") {
    const formattedOrder = formatOrder(payload);

    // Start:: Get store identification data
    // Get store ID via unauthenticated admin client (correct for webhooks)
    const { admin } = await unauthenticated.admin(shop);
    const storeData = await getStoreData(admin);
    const storeId = storeData?.id;
    // End:: Comment

    // Start:: Fetch store settings database
    const storeSettings = await prisma.storeSettings.findFirst({
      where: {
        storeId,
      },
      include: {
        requestScheduling: true,
        emailSettings: true,
        publishingModeration: true,
        widgetsSettings: true,
        brandingSettings: true,
        adminNotification: true,
      },
    });
    // End:: Fetch store settings database

    // Start:: Validate order scheduling options
    // cancelled

    const isRefunded =
      !storeSettings.requestScheduling.isSkipRefundedOrder &&
      (formattedOrder.status === "partially_refunded" ||
        formattedOrder.status === "refunded");

    const isOrderCancelled =
      !storeSettings.requestScheduling.isSkipCancelledOrder &&
      formattedOrder.status === "cancelled";

    const isCorrectOrderValue =
      Number(storeSettings.requestScheduling.minimumOrderValue) <=
      Number(formattedOrder.totalPrice);

    const isEnableAutomaticRequest =
      storeSettings.requestScheduling.isAutomaticRequest;

    const isEnableReminderRequest =
      storeSettings.requestScheduling.isReminderRequest;

    const requestEmailDelayMs =
      Number(storeSettings?.requestScheduling?.sendRequestAfterDelivery) *
      24 *
      60 *
      60 *
      1000;
    const reminderEmailDelayMs =
      requestEmailDelayMs +
      Number(storeSettings?.requestScheduling?.reminderRequestDelay) *
        24 *
        60 *
        60 *
        1000;
    // End:: Comment
    // Start:: Check existing customer review
    let isReviewExists = false;

    const res = await prisma.review.findFirst({
      where: {
        storeId: storeData.id,
        productId: formattedOrder?.products?.[0]?.productId
          ? String(formattedOrder?.products?.[0]?.productId)
          : undefined,
        reviewerEmail: formattedOrder?.email,
      },
    });
    if (res?.reviewerEmail === formattedOrder?.email) {
      isReviewExists = true;
    }
    // End:: Check existing customer review

    // Start:: Format email message body
    function formetEmailBody(message) {
      return message
        .replace(/{{first_name}}/g, "")
        .replace(
          /{{store_name}}/g,
          storeSettings.brandingSettings.storeDisplayName ?? "",
        )
        .replace(
          /{{product_name}}/g,
          formattedOrder?.products?.[0]?.title ?? "",
        );
    }
    // End:: Format email message body

    if (isRefunded && isOrderCancelled && isCorrectOrderValue) {
      // Start:: Enrich products with handle and url from Shopify
      const enrichedProducts = await Promise.all(
        (formattedOrder.products ?? [])?.map(async (item) => {
          const gid = item.productId
            ? String(item.productId).startsWith("gid://")
              ? item.productId
              : `gid://shopify/Product/${item.productId}`
            : null;

          if (!gid) return item;

          try {
            const product = await getProduct(admin, gid);
            const productHandle =
              product?.handle ?? item.productHandle ?? item.handle ?? null;
            const productUrl =
              product?.onlineStoreUrl ??
              (productHandle
                ? `https://${shop}/products/${productHandle}?isOpen=true&orderId=${formattedOrder?.orderId.split("#")[1]}`
                : null);

            return {
              ...item,
              productHandle,
              handle: productHandle,
              image: product?.featuredImage?.url ?? item.image ?? null,
              url: productUrl ?? item.url ?? null,
            };
          } catch (error) {
            console.error("Failed to enrich order product", {
              productId: item.productId,
              error,
            });
            return item;
          }
        }),
      );

      formattedOrder.products = enrichedProducts;
      // End:: Enrich products

      // Start:: Prepare email templates data
      const requestEmailData = {
        to: formattedOrder.email,
        from: storeSettings?.emailSettings?.smtpUser,
        replyTo: storeSettings?.brandingSettings?.storeReplyToEmail,
        templateName: "RequestsEmail",
        subject: storeSettings?.emailSettings?.requestEmailSubjectLine,
        smtpConfig: {
          smtpHost: storeSettings?.emailSettings?.smtpHost,
          smtpPort: storeSettings?.emailSettings?.smtpPort,
          smtpUser: storeSettings?.emailSettings?.smtpUser,
          smtpPassword: storeSettings?.emailSettings?.smtpPassword,
        },
        templateData: {
          name: formattedOrder?.fullName,
          storeTagline: storeSettings?.brandingSettings?.storeTagline,
          timeAgo: formattedOrder?.timeAgo,

          products: formattedOrder?.products ?? [],

          storeName: storeSettings?.brandingSettings?.storeDisplayName,

          requestEmailBody: formetEmailBody(
            storeSettings?.emailSettings?.reminderEmailBody,
          ),
          requestEmailButton: storeSettings?.emailSettings?.reminderEmailButton,

          storeFooterText:
            storeSettings?.brandingSettings?.storeFooterText ?? "",
          storeFooterLinkText:
            storeSettings?.brandingSettings?.storeFooterLinkText ?? "",
          isShowFooterBadge: storeSettings?.brandingSettings?.isShowFooterBadge,

          storeLogo: storeSettings?.brandingSettings?.storeLogo,
          storeLogoPosition: storeSettings?.brandingSettings?.storeLogoPosition,
          emailPrimaryButtonColor:
            storeSettings?.brandingSettings?.emailPrimaryButtonColor,
          emailButtonTextColor:
            storeSettings?.brandingSettings?.emailButtonTextColor,
          emailBackgroundColor:
            storeSettings?.brandingSettings?.emailBackgroundColor,
          emailHeadingColor: storeSettings?.brandingSettings?.emailHeadingColor,
          emailBodyTextColor:
            storeSettings?.brandingSettings?.emailBodyTextColor,
          emailAccentBorderColor:
            storeSettings?.brandingSettings?.emailAccentBorderColor,
        },
      };

      const reminderEmailData = {
        to: formattedOrder.email,
        from: storeSettings?.emailSettings?.smtpUser,
        replyTo: storeSettings?.brandingSettings?.storeReplyToEmail,
        templateName: "ReminderEmail",
        subject: storeSettings?.emailSettings?.reminderSubjectLine,
        smtpConfig: {
          smtpHost: storeSettings?.emailSettings?.smtpHost,
          smtpPort: storeSettings?.emailSettings?.smtpPort,
          smtpUser: storeSettings?.emailSettings?.smtpUser,
          smtpPassword: storeSettings?.emailSettings?.smtpPassword,
        },
        templateData: {
          name: formattedOrder?.fullName,
          storeTagline: storeSettings?.brandingSettings?.storeTagline,
          timeAgo: formattedOrder?.timeAgo,

          products: formattedOrder?.products ?? [],

          storeName: storeSettings?.brandingSettings?.storeDisplayName,

          reminderEmailBody: formetEmailBody(
            storeSettings?.emailSettings?.reminderEmailBody,
          ),
          reminderEmailButton:
            storeSettings?.emailSettings?.reminderEmailButton,

          storeFooterText:
            storeSettings?.brandingSettings?.storeFooterText ?? "",
          storeFooterLinkText:
            storeSettings?.brandingSettings?.storeFooterLinkText ?? "",
          isShowFooterBadge: storeSettings?.brandingSettings?.isShowFooterBadge,

          storeLogo: storeSettings?.brandingSettings?.storeLogo,
          storeLogoPosition: storeSettings?.brandingSettings?.storeLogoPosition,
          emailPrimaryButtonColor:
            storeSettings?.brandingSettings?.emailPrimaryButtonColor,
          emailButtonTextColor:
            storeSettings?.brandingSettings?.emailButtonTextColor,
          emailBackgroundColor:
            storeSettings?.brandingSettings?.emailBackgroundColor,
          emailHeadingColor: storeSettings?.brandingSettings?.emailHeadingColor,
          emailBodyTextColor:
            storeSettings?.brandingSettings?.emailBodyTextColor,
          emailAccentBorderColor:
            storeSettings?.brandingSettings?.emailAccentBorderColor,
        },
      };
      // End:: Comment

      // Start:: Add jobs to queue
      let scheduledJobResponse = {};
      let reminderJobResponse = {};

      if (isEnableAutomaticRequest) {
        scheduledJobResponse = await addJobInQueue(
          reviewQueue,
          "JOB_SCHEDULE_EMAIL",
          {
            emailData: requestEmailData,
            payload: {
              storeId: storeId,
              orderId: formattedOrder.orderId,
            },
          },
          requestEmailDelayMs,
          `request_${storeId}_${formattedOrder.orderId}`,
        );
      }

      if (isEnableReminderRequest)
        reminderJobResponse = await addJobInQueue(
          reviewQueue,
          "JOB_REMINDER_EMAIL",
          {
            emailData: reminderEmailData,
            payload: {
              storeId,
              orderId: formattedOrder.orderId,
            },
          },
          reminderEmailDelayMs,
          `reminder_${storeId}_${formattedOrder.orderId}`,
        );
      // End:: Comment

      console.log(
        "job----added done-------------=========&&&&&",
        scheduledJobResponse?.id,
        reminderJobResponse?.id,
      );

      // Start:: Update order job IDs
      await prisma.order.update({
        where: {
          storeId_orderId: {
            storeId: storeId,
            orderId: formattedOrder.orderId,
          },
        },
        data: {
          fulfillmentStatus: formattedOrder.fulfillmentStatus ?? "unfulfilled",
          paymentStatus: formattedOrder.status,
          reviewCheckStatus: "PENDING",
          redisBullmqJobId: {
            reviewRequestId: scheduledJobResponse?.id ?? null,
            reminderJobId: reminderJobResponse?.id ?? null,
          },
        },
      });
      // End:: Comment
    }

    if (!isRefunded || !isOrderCancelled) {
      const orderData = await prisma.order.findFirst({
        where: {
          storeId: storeId,
          orderId: formattedOrder.orderId,
        },
      });
      if (orderData) {
        const redisBullmqJobId = orderData?.redisBullmqJobId;
        if (redisBullmqJobId?.reviewRequestId) {
          await removeJobInQueue(reviewQueue, redisBullmqJobId.reviewRequestId);
        }
        if (redisBullmqJobId?.reminderJobId) {
          await removeJobInQueue(reviewQueue, redisBullmqJobId.reminderJobId);
        }
      }

      await prisma.order.update({
        where: {
          storeId_orderId: {
            storeId: storeId,
            orderId: formattedOrder.orderId,
          },
        },
        data: {
          fulfillmentStatus: formattedOrder.fulfillmentStatus ?? "unfulfilled",
          paymentStatus: formattedOrder.status,
          reviewCheckStatus: "PENDING",
          redisBullmqJobId: {
            reviewRequestId: null,
            reminderJobId: null,
          },
        },
      });
    }

    return new Response(JSON.stringify(formattedOrder), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(null, { status: 200 });
};

function formatOrder(order) {
  const customer = order.customer || {};
  const fullName =
    `${customer.first_name || ""} ${customer.last_name || ""}`.trim() ||
    order.billing_address?.name ||
    "N/A";

  const email = order.email || customer.email || "";

  const emailHash = crypto
    .createHash("md5")
    .update(email.trim().toLowerCase())
    .digest("hex");
  const avatar = `https://www.gravatar.com/avatar/${emailHash}?d=identicon`;

  return {
    id: order.name,
    orderId: order.name,
    fullName,
    email,
    emailVerified: customer.verified_email || false,
    avatar,
    status: order.financial_status,
    fulfillmentStatus: order.fulfillment_status,
    createdAt: order.created_at,
    timeAgo: getRelativeTime(order.created_at),

    totalPrice: order.current_total_price,

    currency: order.subtotal_price_set.shop_money.currency_code,

    products: (order.line_items || []).map((item) => ({
      title: item.title,
      productId: item.product_id,
      productHandle: item.handle,
      quantity: item.quantity,
      url: item.url,
    })),
  };
}

function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  if (diffMonth < 12)
    return `${diffMonth} month${diffMonth > 1 ? "s" : ""} ago`;
  return `${diffYear} year${diffYear > 1 ? "s" : ""} ago`;
}
