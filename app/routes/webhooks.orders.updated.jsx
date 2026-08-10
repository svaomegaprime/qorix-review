import { authenticate, unauthenticated } from "../shopify.server";
import prisma from "../db.server";
import { getStoreData } from "../utils/getStoreData";
import { addJobInQueue } from "../lib/bullmq/bullmq.queue";
import { reviewQueue } from "../lib/bullmq/bullmq.queue";
import { formatOrder } from "../utils/formatOrder.js";
import { enrichOrderProducts } from "../services/productEnrichment.server.js";
import { getReviewedProductIdsForOrder } from "../services/orders.server.js";
import { normalizeShopifyId } from "../utils/shopifyGid.js";
import {
  buildReminderEmailData,
  buildRequestEmailData,
} from "../services/emailPayload.server.js";

export const action = async ({ request }) => {
  const { topic, shop, payload } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);

  if (topic === "ORDERS_UPDATED") {
    const formattedOrder = formatOrder(payload);
    if (
      formattedOrder.status === "refunded" ||
      formattedOrder.fulfillmentStatus !== "fulfilled"
    ) {
      return new Response(JSON.stringify({ message: "refunded" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(formattedOrder.fulfillmentStatus, "fulfillmentStatus");

    // Start:: Get store identification data
    // Get store ID via unauthenticated admin client (correct for webhooks)
    const { admin } = await unauthenticated.admin(shop);
    const storeData = await getStoreData(admin);
    const storeId = storeData?.id;
    // End:: Get store identification data

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
    // fulfilled
    if (!storeSettings.requestScheduling?.isAutomaticRequest) {
      return new Response(
        JSON.stringify({ message: "Automatic request is disabled" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const isFulfilled =
      storeSettings?.requestScheduling?.isAutomaticRequest &&
      formattedOrder.fulfillmentStatus === "fulfilled";

    const isRefunded =
      storeSettings.requestScheduling.isSkipRefundedOrder &&
      (formattedOrder.status === "partially_refunded" ||
        formattedOrder.status === "refunded");

    const isCorrectOrderValue =
      Number(storeSettings.requestScheduling.minimumOrderValue) <=
      Number(formattedOrder.totalPrice);

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
    // End:: Validate order scheduling options
    // Start:: Check reviews linked to this exact order
    const reviewedProductIds = await getReviewedProductIdsForOrder({
      storeId,
      orderId: formattedOrder.orderId,
    });
    const isReviewExists = reviewedProductIds.size > 0;
    // End:: Check existing customer review

    const isOrderCancel =
      storeSettings.requestScheduling.isSkipCancelledOrder &&
      formattedOrder.status === "refunded";
    // Start:: check order is eligible for review request and add jobs in queue
    console.log(
      "FROM update: isFulfilled",
      isFulfilled,
      "isRefunded",
      !isRefunded,
      "isCorrectOrderValue",
      isCorrectOrderValue,
      "isReviewExists",
      !isReviewExists,
      "isOrderCancel",
      !isOrderCancel,
    );

    if (
      isFulfilled &&
      !isRefunded &&
      isCorrectOrderValue &&
      !isReviewExists &&
      !isOrderCancel
    ) {
      // Start:: Enrich products with handle and url from Shopify
      const enrichedOrder = await enrichOrderProducts(
        formattedOrder,
        admin,
        shop,
      );
      formattedOrder.products = enrichedOrder.products;
      // End:: Enrich products

      const requestEmailData = buildRequestEmailData(
        formattedOrder,
        storeSettings,
        { firstName: "" },
      );
      const reminderEmailData = buildReminderEmailData(
        formattedOrder,
        storeSettings,
        { firstName: "" },
      );

      // Start:: Add jobs to queue
      const scheduledJobResponse = await addJobInQueue(
        reviewQueue,
        "JOB_SCHEDULE_EMAIL",
        {
          emailData: requestEmailData,
          payload: {
            storeId,
            orderId: formattedOrder.orderId,
          },
        },
        requestEmailDelayMs,
        `request_${storeId}_${formattedOrder.orderId}`,
      );
      let reminderJobResponse;
      if (storeSettings?.requestScheduling?.isReminderRequest) {
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
      }
      // End:: Comment

      console.log(
        "job----added done-------------=========&&&&&",
        scheduledJobResponse.id,
        reminderJobResponse?.id,
      );

      // Start:: Stamp isReviewed on each product from existing reviews
      formattedOrder.products = formattedOrder.products.map((item) => ({
        ...item,
        isReviewed: reviewedProductIds.has(
          normalizeShopifyId(item.productId),
        ),
      }));
      // End:: Stamp isReviewed

      // Start:: Upsert order job IDs (update if exists, create if not)
      await prisma.$transaction(async (tx) => {
        const orderDb = await tx.order.upsert({
          where: {
            storeId_orderId: {
              storeId: storeId,
              orderId: formattedOrder.orderId,
            },
          },
          update: {
            fulfillmentStatus: formattedOrder.fulfillmentStatus ?? "unfulfilled",
            paymentStatus: formattedOrder.status,
            reviewCheckStatus: "PENDING",
            requestType: "AUTOMATIC",
            redisBullmqJobId: {
              reviewRequestId: scheduledJobResponse?.id ?? null,
              reminderJobId: reminderJobResponse?.id ?? null,
            },
          },
          create: {
            storeId: storeId,
            orderId: formattedOrder.orderId,
            fulfillmentStatus: formattedOrder.fulfillmentStatus ?? "unfulfilled",
            paymentStatus: formattedOrder.status ?? "",
            userEmail: formattedOrder.email ?? "",
            reviewCheckStatus: "PENDING",
            requestType: "AUTOMATIC",
            totalPrice: formattedOrder.totalPrice ?? null,
            currency: formattedOrder.currency ?? null,
            redisBullmqJobId: {
              reviewRequestId: scheduledJobResponse?.id ?? null,
              reminderJobId: reminderJobResponse?.id ?? null,
            },
          },
        });

        // Delete existing line items to replace with fresh ones
        await tx.orderLineItem.deleteMany({
          where: {
            orderId: orderDb.id,
          },
        });

        // Create line items
        if (formattedOrder.products && formattedOrder.products.length > 0) {
          await tx.orderLineItem.createMany({
            data: formattedOrder.products.map((p) => ({
              orderId: orderDb.id,
              productId: String(p.productId),
              title: p.title,
              quantity: p.quantity,
              handle: p.productHandle ?? p.handle ?? null,
              url: p.url ?? null,
              image: p.image ?? null,
              isReviewed: p.isReviewed ?? false,
            })),
          });
        }
      });
      // End:: Upsert order
    }
    // End:: check order is eligible for review request and add jobs in queue

    return new Response(JSON.stringify(formattedOrder), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(null, { status: 200 });
};
