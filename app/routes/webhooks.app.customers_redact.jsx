import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const action = async ({ request }) => {
  try {
    const { payload } = await authenticate.webhook(request);

    const email = String(payload?.customer?.email || "")
      .trim()
      .toLowerCase();

    const shopId = `gid://shopify/Shop/${payload?.shop_id}`;

    if (!email) {
      console.log("customers/redact: Customer email not found", {
        shopId,
        customerId: payload?.customer?.id,
      });
      console.log("OK");
      return new Response("OK", { status: 200 });
    }

    const deleteResult = await prisma.review.deleteMany({
      where: {
        storeId: shopId,
        reviewerEmail: email,
      },
    });

    console.log("customers/redact completed", {
      shopId,
      customerId: payload?.customer?.id,
      email,
      deletedReviews: deleteResult.count,
    });

    return new Response("OK", {
      status: 200,
      statusText: "OK",
    });
  } catch (error) {
    console.error("customers/redact webhook error:", error);

    return new Response("Unauthorized", {
      status: 401,
      statusText: "Unauthorized",
    });
  }
};
