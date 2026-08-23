import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { sendEmail } from "../utils/sendEmail";
import { buildSmtpConfig } from "../services/emailPayload.server.js";

export const action = async ({ request }) => {
  try {
    const { payload } = await authenticate.webhook(request);

    const customerEmail = String(payload?.customer?.email || "")
      .trim()
      .toLowerCase();
    const storeId = `gid://shopify/Shop/${payload?.shop_id}`;

    if (!customerEmail) {
      console.log("[customers/data_request] no customer email", { storeId });
      return new Response("OK", { status: 200 });
    }

    const reviews = await prisma.review.findMany({
      where: {
        storeId,
        reviewerEmail: customerEmail,
      },
      select: {
        id: true,
        productTitle: true,
        reviewerName: true,
        reviewerEmail: true,
        rating: true,
        body: true,
        status: true,
        createdAt: true,
        attachments: {
          select: { type: true, url: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get SMTP config to send via merchant's email
    const storeSettings = await prisma.storeSettings.findFirst({
      where: { storeId },
      include: { emailSettings: true },
    });

    const emailSettings = storeSettings?.emailSettings ?? {};
    const merchantEmail =
      emailSettings?.smtpSenderEmail || emailSettings?.smtpUser || "";

    if (!merchantEmail) {
      console.warn("[customers/data_request] no SMTP user configured", {
        storeId,
      });
      return new Response("OK", { status: 200 });
    }

    await sendEmail({
      to: "mdeftakharulislamkhan@gmail.com",
      from: "mdeftakharulislamkhan@gmail.com",
      subject: "Customer Data Request",
      templateName: "UserData",
      smtpConfig: buildSmtpConfig(emailSettings),
      templateData: {
        reviews,
        customer: {
          id: payload?.customer?.id || "",
          email: customerEmail,
        },
      },
    });

    console.log("[customers/data_request] sent", {
      storeId,
      customerEmail,
      reviewCount: reviews.length,
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[customers/data_request] failed", error);
    return new Response("Unauthorized", { status: 401 });
  }
};
