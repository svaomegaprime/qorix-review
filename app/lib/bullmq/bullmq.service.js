import { sendEmail } from "../../utils/sendEmail";
import prisma from "../../db.server";

async function scheduleEmailSend(jobData) {
  const emailData = jobData?.emailData || jobData;
  const payload = jobData?.payload;

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
}

async function reminderEmailSend(jobData) {
  const emailData = jobData?.emailData || jobData;
  const payload = jobData?.payload;

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
}

const bullmqService = {
  scheduleEmailSend,
  reminderEmailSend,
};

export default bullmqService;
