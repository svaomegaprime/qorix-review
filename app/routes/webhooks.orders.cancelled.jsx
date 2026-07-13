import { authenticate, unauthenticated } from "../shopify.server";
import prisma from "../db.server";
import { getStoreData } from "../utils/getStoreData";
import {
  addJobInQueue,
  reviewQueue,
  removeJobInQueue,
} from "../lib/bullmq/bullmq.queue";
import { formatOrder } from "../utils/formatOrder.js";
import { enrichOrderProducts } from "../services/productEnrichment.server.js";
import {
  buildReminderEmailData,
  buildRequestEmailData,
} from "../services/emailPayload.server.js";

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
    if (isRefunded && isOrderCancelled && isCorrectOrderValue) {
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
