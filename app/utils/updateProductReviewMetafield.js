import prisma from "../db.server";
import { toProductGid } from "./shopifyGid.js";
export async function updateProductReviewMetafields(admin, productId, storeId) {
  if (!admin) throw new Error("admin is required");
  if (!productId) throw new Error("productId is required");
  if (!storeId) throw new Error("storeId is required");

  try {
    const productGid = toProductGid(productId);

    const reviews = await prisma.review.findMany({
      where: {
        storeId,
        productId: String(productId),
        status: "PUBLISHED",
      },
      select: {
        rating: true,
      },
    });

    const reviewCount = reviews.length;

    const totalRating = reviews.reduce(
      (sum, review) => sum + (Number(review.rating) || 0),
      0
    );

    const averageRating =
      reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : "0.0";

    const mutation = `
      mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
            value
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await admin.graphql(mutation, {
      variables: {
        metafields: [
          {
            ownerId: productGid,
            // namespace: "qorix_review",
            key: "average_rating",
            type: "number_decimal",
            value: averageRating,
          },
          {
            ownerId: productGid,
            // namespace: "qorix_review",
            key: "review_count",
            type: "number_integer",
            value: String(JSON.stringify(reviews)),
          },
        ],
      },
    });

    const json = await response.json();

    const userErrors = json?.data?.metafieldsSet?.userErrors || [];
    if (userErrors.length) {
      console.error("[updateProductReviewMetafields] userErrors:", userErrors);
      throw new Error(userErrors.map((e) => e.message).join(", "));
    }

    return {
      ok: true,
      productId: productGid,
      reviewCount,
      averageRating,
      metafields: json?.data?.metafieldsSet?.metafields || [],
    };
  } catch (error) {
    console.error("[updateProductReviewMetafields] error:", error);
    throw error;
  }
}
