import prisma from "../db.server";

export async function updateProductReviewDefineMetafields(
  admin,
  productId,
  storeId
) {
  if (!admin) throw new Error("admin is required");
  if (!productId) throw new Error("productId is required");
  if (!storeId) throw new Error("storeId is required");

  try {
    const productGid = String(productId).startsWith(
      "gid://shopify/Product/"
    )
      ? String(productId)
      : `gid://shopify/Product/${productId}`;

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
    console.error(
      "[updateProductReviewMetafields] error:",
      error
    );
    throw error;
  }
}