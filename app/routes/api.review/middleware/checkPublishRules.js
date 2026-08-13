import { personalInfoFilter, profanityFilter } from "./contentFilter";

export default function checkPublishRules(
  publishingModeration,
  reviewData,
  { isVerified = false } = {},
) {
  const {
    autoPublishRules,
    isLowRatingHold,
    isProfanityFilter,
    isPersonalInfoFilter,
  } = publishingModeration;
  const { rating, body } = reviewData;

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
