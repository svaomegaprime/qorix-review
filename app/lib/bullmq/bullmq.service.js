import { sendEmail } from "../../utils/sendEmail";
import prisma from "../../db.server";

async function sendQueuedEmail(jobData) {
  const emailData = jobData?.emailData || jobData;
  const payload = jobData?.payload;
  try {
    await sendEmail(emailData);
    console.log("email sent successfully");

    if (payload?.storeId && payload?.orderId) {
      await prisma.order.update({
        where: {
          storeId_orderId: {
            storeId: payload.storeId,
            orderId: payload.orderId,
          },
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
      await prisma.order.update({
        where: {
          storeId_orderId: {
            storeId: payload.storeId,
            orderId: payload.orderId,
          },
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

const bullmqService = {
  scheduleEmailSend: sendQueuedEmail,
  reminderEmailSend: sendQueuedEmail,
  clientConfirmationEmailSend: clientConfirmationEmailSend,
  adminConfirmationEmailSend: adminConfirmationEmailSend,
};

export default bullmqService;
