import CustomText from "../../essentials/elements/Text";
import CustomSection from "../../essentials/CustomSection";
import ReviewItem from "../../essentials/ReviewItem";
import HalfStar from "../../essentials/elements/HalfStar";
import ReviewPipeItem from "./elements/ReviewPipeItem";
import PaidIcon from "../../essentials/PaidIcon";
import checkPricingPlan from "../../../utils/checkPricingPlan";
export default function ReviewBreakdown({
  reviews = [],
  handleStatusUpdate,
  handleReviewDelete,
  handleReviewReply,
  isAppEnabled = false,
  planState,
}) {
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(
          1,
        )
      : "0.0";
  const numAvgRating = Number(averageRating);
  const stars = Array.from({ length: 5 }, (_, i) => {
    const fillAmount = Math.max(0, Math.min(1, numAvgRating - i));
    return fillAmount * 100;
  });

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const rating = Math.round(r.rating);
    if (ratingCounts[rating] !== undefined) {
      ratingCounts[rating]++;
    }
  });

  return (
    <>
      <s-query-container>
        <s-grid
          gridTemplateColumns="@container (inline-size > 600px) '1fr 340px', 1fr"
          gap="base"
        >
          {/* Recent reviews start */}
          <s-section>
            <s-stack
              direction="inline"
              justifyContent="space-between"
              alignItems="center"
              gap="small"
            >
              <CustomText as="h3">
                Recent reviews{" "}
                {!checkPricingPlan(
                  planState?.activePlan,
                  "standard-plan",
                  "pro-plan",
                  "plus-plan",
                  "unlimited",
                ) && <PaidIcon />}
              </CustomText>
              <s-button href="/app/reviews" variant="tertiary">
                <s-stack direction="inline" alignItems="center">
                  <s-paragraph tone="success">View all</s-paragraph>{" "}
                  <s-icon tone="success" type="arrow-right" />
                </s-stack>
              </s-button>
            </s-stack>
            <s-grid gap="base" paddingBlockStart="base">
              {reviews?.length > 0 ? (
                reviews.slice(0, 3).map((review) => (
                  <CustomSection key={review.id}>
                    <ReviewItem
                      data={review}
                      handleStatusUpdate={handleStatusUpdate}
                      handleReviewDelete={handleReviewDelete}
                      handleReviewReply={handleReviewReply}
                      planState={planState}
                    />
                  </CustomSection>
                ))
              ) : (
                <CustomSection>
                  <s-stack
                    direction="inline"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <s-paragraph>No reviews found</s-paragraph>
                  </s-stack>
                </CustomSection>
              )}
            </s-grid>
          </s-section>
          {/* Recent reviews end */}

          <s-grid gap="base">
            {/* Rating breakdown start */}
            <s-section>
              <s-grid
                gridTemplateColumns="2fr 1fr"
                justifyContent="space-between"
                alignItems="center"
              >
                <s-stack gap="base">
                  <CustomText as="h3">
                    Rating breakdown

                   {!checkPricingPlan(
                    planState?.activePlan,
                    "standard-plan",
                    "pro-plan",
                    "plus-plan",
                    "unlimited",
                  ) && <PaidIcon />}
                  </CustomText>
                  <s-box>
                    <CustomText as="h2">{averageRating}</CustomText>
                    <s-grid
                      gridTemplateColumns="repeat(5, 20px)"
                      alignItems="center"
                    >
                      {stars.map((fillPercentage, idx) => (
                        <HalfStar
                          key={idx}
                          width={fillPercentage}
                          color="#FF9500"
                        />
                      ))}
                    </s-grid>
                    <s-paragraph color="subdued">
                      {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                    </s-paragraph>
                  </s-box>
                </s-stack>
                <s-stack>
                  <ReviewPipeItem
                    starFor={5}
                    totalReviews={totalReviews}
                    earnedReviews={ratingCounts[5]}
                  />
                  <ReviewPipeItem
                    starFor={4}
                    totalReviews={totalReviews}
                    earnedReviews={ratingCounts[4]}
                  />
                  <ReviewPipeItem
                    starFor={3}
                    totalReviews={totalReviews}
                    earnedReviews={ratingCounts[3]}
                  />
                  <ReviewPipeItem
                    starFor={2}
                    totalReviews={totalReviews}
                    earnedReviews={ratingCounts[2]}
                  />
                  <ReviewPipeItem
                    starFor={1}
                    totalReviews={totalReviews}
                    earnedReviews={ratingCounts[1]}
                  />
                </s-stack>
              </s-grid>
            </s-section>
            {/* Rating breakdown end */}

            {/* App features status start */}
            <s-section>
              <CustomText as="h3">Status</CustomText>
              <s-stack paddingBlockStart="small" gap="small">
                <CustomSection>
                  <s-grid
                    gridTemplateColumns="1fr auto"
                    justifyContent="space-between"
                    alignItems="center"
                    gap="small"
                  >
                    <s-heading>Widgets</s-heading>
                    <s-badge tone={isAppEnabled ? "success" : "warning"}>
                      {isAppEnabled ? "Embed enabled" : "Embed disabled"}
                    </s-badge>
                  </s-grid>
                </CustomSection>
                <CustomSection>
                  <s-grid
                    gridTemplateColumns="1fr auto"
                    justifyContent="space-between"
                    alignItems="center"
                    gap="small"
                  >
                    <s-heading>Requests</s-heading>
                    <s-badge tone="success">Requests enabled</s-badge>
                  </s-grid>
                </CustomSection>
              </s-stack>
            </s-section>
            {/* App features status end */}
            {/* Quick actions start */}
            <s-section>
              <CustomText as="h3">Quick actions</CustomText>
              <s-grid
                gridTemplateColumns="1fr 1fr"
                gap="small"
                paddingBlockStart="small"
              >
                <s-grid-item>
                  <s-clickable
                    href="/app/requests"
                    padding="base"
                    borderRadius="large"
                    overflow="hidden"
                    border="base"
                  >
                    <s-stack gap="small">
                      <s-avatar src="/inbox-icon.svg" />
                      <s-heading>Request reviews</s-heading>
                    </s-stack>
                  </s-clickable>
                </s-grid-item>
                <s-grid-item>
                  <s-clickable
                    href="/app/settings"
                    padding="base"
                    borderRadius="large"
                    overflow="hidden"
                    border="base"
                  >
                    <s-stack gap="small">
                      <s-avatar src="/settings-icon.svg" />
                      <s-heading>App settings</s-heading>
                    </s-stack>
                  </s-clickable>
                </s-grid-item>
                <s-grid-item gridColumn="span 2">
                  <s-clickable
                    href="/app/widgets"
                    padding="base"
                    borderRadius="large"
                    overflow="hidden"
                    border="base"
                  >
                    <s-stack gap="small">
                      <s-avatar src="/desktop-icon.svg" />
                      <s-heading>Customize widget</s-heading>
                    </s-stack>
                  </s-clickable>
                </s-grid-item>
              </s-grid>
            </s-section>
            {/* Quick actions end */}
          </s-grid>
        </s-grid>
      </s-query-container>
    </>
  );
}
