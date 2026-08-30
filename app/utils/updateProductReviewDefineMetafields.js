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

export async function updateProductReviewDefineMetafields(
  admin,
  productId,
  storeId
) {
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
      reviewCount > 0 ? totalRating / reviewCount : 0;

    if (reviewCount === 0) {
      const response = await admin.graphql(
        `
        mutation ResetMetafields($deleteInput: [MetafieldIdentifierInput!]!, $setInput: [MetafieldsSetInput!]!) {
          metafieldsDelete(metafields: $deleteInput) {
            userErrors {
              field
              message
            }
          }
          metafieldsSet(metafields: $setInput) {
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
        `,
        {
          variables: {
            deleteInput: [
              {
                ownerId: productGid,
                namespace: "reviews",
                key: "rating",
              },
            ],
            setInput: [
              {
                ownerId: productGid,
                namespace: "reviews",
                key: "rating_count",
                type: "number_integer",
                value: "0",
              },
            ],
          },
        }
      );

      const json = await response.json();
      const deleteErrors = json?.data?.metafieldsDelete?.userErrors || [];
      const setErrors = json?.data?.metafieldsSet?.userErrors || [];
      const userErrors = [...deleteErrors, ...setErrors];

      if (userErrors.length > 0) {
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

        console.error(
          "[updateProductReviewMetafields] userErrors:",
          userErrors
        );
        throw new Error(
          userErrors.map((e) => e.message).join(", ")
        );
      }

      return {
        ok: true,
        productId: productGid,
        reviewCount: 0,
        averageRating: "0.0",
        metafields: json?.data?.metafieldsSet?.metafields || [],
      };
    }

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
          // Product rating
          {
            ownerId: productGid,
            namespace: "reviews",
            key: "rating",
            type: "rating",
            value: JSON.stringify({
              value: averageRating.toFixed(1),
              scale_min: "1.0",
              scale_max: "5.0",
            }),
          },

          // Review count
          {
            ownerId: productGid,
            namespace: "reviews",
            key: "rating_count",
            type: "number_integer",
            value: String(reviewCount),
          },
        ],
      },
    });

    const json = await response.json();

    const userErrors =
      json?.data?.metafieldsSet?.userErrors || [];

    if (userErrors.length > 0) {
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

      console.error(
        "[updateProductReviewMetafields] userErrors:",
        userErrors
      );

      throw new Error(
        userErrors.map((e) => e.message).join(", ")
      );
    }

    return {
      ok: true,
      productId: productGid,
      reviewCount,
      averageRating: averageRating.toFixed(1),
      metafields:
        json?.data?.metafieldsSet?.metafields || [],
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

    console.error(
      "[updateProductReviewMetafields] error:",
      error
    );
    throw error;
  }
}
