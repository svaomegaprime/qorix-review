import { getOrders } from "../../../utils/sync.orders";
import { personalInfoFilter, profanityFilter } from "./contentFilter";

export default async function checkPublishRules(
  session,
  publishingModeration,
  reviewData,
) {
  const {
    autoPublishRules,
    isLowRatingHold,
    isProfanityFilter,
    isPersonalInfoFilter,
  } = publishingModeration;
  const { productId, reviewerEmail, rating, body } = reviewData;

  const orders = await getOrders(session.shop, session.accessToken);

  const isVerified = reviewerEmail
    ? orders.some(
        (order) =>
          order.email === reviewerEmail &&
          order.products.some(
            (product) =>
              product.productId === `gid://shopify/Product/${productId}`,
          ),
      )
    : false;
  console.log("isVerified", isVerified, productId);

  const isRatingLowByTwo = isLowRatingHold && rating <= 2;

  let filteredBody = body;
  if (isProfanityFilter)
    filteredBody = profanityFilter(filteredBody).cleanContent;
  if (isPersonalInfoFilter) filteredBody = personalInfoFilter(filteredBody);

  const checkedPublishRules = {
    isVerified,
    body: filteredBody,
    status: "PENDING",
  };

  switch (autoPublishRules) {
    case "AUTO_PUBLISH":
      checkedPublishRules.status = "PUBLISHED";
      break;
    case "VERIFIED_ONLY":
      checkedPublishRules.status = isVerified ? "PUBLISHED" : "PENDING";
      break;
    case "MANUAL_PUBLISH":
      checkedPublishRules.status = "PENDING";
      break;
  }

  if (isRatingLowByTwo) {
    checkedPublishRules.status = "PENDING";
  }

  return checkedPublishRules;
}
