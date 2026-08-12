import prisma from "../../db.server";
import { AppError } from "../../utils/appError.server";
import { invalidateReviewCache } from "../../lib/redis/reviewCache.js";

async function toggleHelpful(request) {
  const body = await request.json();
  console.log(body);

  try {
    const reviewId = String(body.reviewId || "");
    const customerEmail = String(body.customerEmail || "").trim();
    const customerId = String(body.customerId || "").trim();
    const isHelpful = Boolean(body.isHelpful);

    if (!reviewId || !customerEmail || !customerId) {
      throw new Error("reviewId, customerId and customerEmail are required");
    }

    const res = await prisma.helpfulCount.upsert({
      where: {
        reviewId_customerEmail: {
          reviewId,
          customerEmail,
        },
      },
      update: {
        customerId,
        isHelpful,
      },
      create: {
        reviewId,
        customerEmail,
        customerId,
        isHelpful,
      },
    });

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { storeId: true, productId: true },
    });

    if (review) {
      await invalidateReviewCache(review.storeId, review.productId);
    }

    return new Response(JSON.stringify({ ok: true, data: res }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[ERROR::api.review]", error);
    return AppError.handle(error);
  }
}

export const helpfulService = {
  toggleHelpful,
};
