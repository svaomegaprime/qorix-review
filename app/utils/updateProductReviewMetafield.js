import prisma from "../db.server";
import { toProductGid } from "./shopifyGid.js";

function isOwnerMissingError(error) {
  if (!error) return false;
  const message = String(error.message || "").toLowerCase();
  const fields = Array.isArray(error.field) ? error.field.map(String) : [];

  if (fields.includes("ownerId")) {
    return true;
  }

  return (
    message.includes("owner does not exist") ||
    message.includes("owner not found") ||
    message.includes("not found") ||
    message.includes("does not exist") ||
    message.includes("could not resolve to a node") ||
    message.includes("invalid global id") ||
    message.includes("record not found")
  );
}

function isOwnerMissingException(error) {
  if (!error) return false;
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("owner does not exist") ||
    message.includes("owner not found") ||
    message.includes("not found") ||
    message.includes("does not exist") ||
    message.includes("could not resolve to a node") ||
    message.includes("invalid global id") ||
    message.includes("record not found") ||
    message.includes("ownerid")
  );
}

export async function updateProductReviewMetafields(admin, productId, storeId) {
  if (!admin) throw new Error("admin is required");
  if (!productId || productId === "null" || productId === "undefined") {
    return {
      ok: true,
      skipped: true,
      reason: "Product ID is missing or invalid",
    };
  }
  if (!storeId) throw new Error("storeId is required");

  try {
    const productGid = toProductGid(productId);
    if (!productGid) {
      return {
        ok: true,
        skipped: true,
        reason: "Invalid product GID",
      };
    }

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
      const isOwnerMissing = userErrors.some(isOwnerMissingError);

      if (isOwnerMissing) {
        console.warn(
          `[updateProductReviewMetafields] Product ${productGid} does not exist in Shopify. Skipping metafields update.`
        );
        return {
          ok: true,
          productId: productGid,
          skipped: true,
          reason: "Owner does not exist in Shopify",
        };
      }

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
    if (isOwnerMissingException(error)) {
      console.warn(
        `[updateProductReviewMetafields] Caught owner missing error for ${productId}. Skipping.`
      );
      return {
        ok: true,
        productId,
        skipped: true,
        reason: "Owner does not exist in Shopify",
      };
    }

    console.error("[updateProductReviewMetafields] error:", error);
    throw error;
  }
}
