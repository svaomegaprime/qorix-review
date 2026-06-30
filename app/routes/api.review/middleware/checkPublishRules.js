import { getOrders } from "../../../utils/sync.orders";
import { personalInfoFilter, profanityFilter } from "./contentFilter";

export default async function checkPublishRules(
    session,
    publishingModeration,
    reviewData
) {
    const { autoPublishRules, isLowRatingHold, isProfanityFilter, isPersonalInfoFilter } = publishingModeration;
    const { productId, reviewerEmail, rating, body } = reviewData;

    const orders = await getOrders(session.shop, session.accessToken);

    const isVerified = reviewerEmail
        ? orders.some(
            (order) =>
                order.email === reviewerEmail &&
                order.products.some((product) => product.id === productId)
        )
        : false;

    const isRatingLowByTwo = isLowRatingHold && rating <= 2;
    const { cleanContent } = profanityFilter(body);

    const sanitized = personalInfoFilter(isProfanityFilter ? cleanContent : body)

    

    const checkedPublishRules = {
        isVerified,
        body: cleanContent,
        status: "PENDING", // default/fallback if no rule matches
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

    // low rating hold always wins — overrides whatever the rule above set
    if (isRatingLowByTwo) {
        checkedPublishRules.status = "PENDING";
    }

    return checkedPublishRules;
}