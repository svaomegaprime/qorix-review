import prisma from "../db.server.js";
import { deleteFile } from "../lib/s3/deleteFile.js";
import { invalidateReviewCache } from "../lib/redis/reviewCache.js";

/** @param {{ reviewId: string, status: string, storeId: string }} input */
export async function updateReviewStatus({ reviewId, status, storeId }) {
  const updated = await prisma.review.update({
    where: { id: reviewId, storeId },
    data: {
      status: /** @type {import("@prisma/client").ReviewStatus} */ (status),
    },
  });

  // Invalidate review cache for this store
  await invalidateReviewCache(storeId);

  return updated;
}

/** @param {{ reviewId: string, createdAt: string | Date, storeId: string }} input */
export async function updateReviewCreatedAt({ reviewId, createdAt, storeId }) {
  const updated = await prisma.review.update({
    where: { id: reviewId, storeId },
    data: {
      createdAt: new Date(createdAt),
    },
  });

  // Invalidate review cache for this store
  await invalidateReviewCache(storeId);

  return updated;
}

/**
 * Delete a store-owned review and clean attachment objects loaded from the DB.
 * Storage failures are logged but do not leave an undeletable admin record.
 *
 * @param {{ reviewId: string, storeId: string }} input
 * @returns {Promise<{ productId: string | null } | false>}
 */
export async function deleteReviewWithAttachments({ reviewId, storeId }) {
  const review = await prisma.review.findFirst({
    where: { id: reviewId, storeId },
    include: { attachments: true },
  });

  if (!review) return false;

  const deletionResults = await Promise.allSettled(
    review.attachments
      .map((attachment) => attachment.url)
      .filter(Boolean)
      .map((url) => deleteFile(url)),
  );

  for (const result of deletionResults) {
    if (result.status === "rejected") {
      console.error("Failed to delete a review attachment", result.reason);
    }
  }

  const deletedReview = await prisma.review.delete({
    where: { id: reviewId, storeId },
  });

  // Invalidate review cache for this store
  await invalidateReviewCache(storeId);

  return { productId: deletedReview.productId };
}
