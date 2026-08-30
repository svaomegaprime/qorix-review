import { Text } from "@shopify/polaris";
import CustomText from "../essentials/elements/Text";
import HalfStar from "../essentials/elements/HalfStar";
import PaidIcon from "../essentials/PaidIcon";
import checkPricingPlan from "../../utils/checkPricingPlan";
export default function Analytics({ reviews, data, pendingOrders, planState }) {
  const arrowUp = "↑";
  const arrowDown = "↓";

  const reviewList = reviews ?? data ?? [];
  const totalReviews = reviewList.length;
  const avgRating =
    totalReviews > 0
      ? reviewList.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
      : 0;
  const pendingReviews = reviewList.filter(
    (r) => r.status === "PENDING",
  ).length;

  const stars = Array.from({ length: 5 }, (_, i) => {
    const fillAmount = Math.max(0, Math.min(1, avgRating - i));
    return fillAmount * 100;
  });

  return (
    <s-stack paddingBlockEnd="base">
      <s-query-container>
        <s-grid
          gap="base"
          gridTemplateColumns="@container (inline-size > 500px) 'repeat(4, 1fr)', 'repeat(2, 1fr)'"
        >
          {/* Total reviews start */}
          <s-box>
            <s-section>
              <s-stack
                direction="inline"
                gap="small"
                alignItems="center"
                justifyContent="space-between"
              >
                <s-heading>
                  Total reviews {" "}
                  {!checkPricingPlan(
                    planState?.activePlan,
                    "standard-plan",
                    "pro-plan",
                    "plus-plan",
                    "unlimited",
                  ) && <PaidIcon />}
                </s-heading>
                <s-icon type="plan" />
              </s-stack>
              <Text as="h2">
                {totalReviews}{" "}
                <s-text>
                  /{" "}
                  {planState?.activePlan == "standard-plan" &&
                  planState?.activePlan != null
                    ? 600
                    : planState?.activePlan == "pro-plan" &&
                        planState?.activePlan != null
                      ? 2000
                      : planState?.activePlan != null
                        ? "Unlimited"
                        : 0}
                </s-text>
              </Text>
              <CustomText as="p" color={"#00BF7A"}>
                {arrowUp} 5 this week
              </CustomText>
            </s-section>
          </s-box>
          {/* Total reviews end */}
          {/* Avg. rating start */}
          <s-box>
            <s-section>
              <s-stack
                direction="inline"
                gap="small"
                alignItems="center"
                justifyContent="space-between"
              >
                <s-heading>
                  Avg. rating {" "}
                   {!checkPricingPlan(
                    planState?.activePlan,
                    "standard-plan",
                    "pro-plan",
                    "plus-plan",
                    "unlimited",
                  ) && <PaidIcon />}
                </s-heading>
                <s-icon type="star-list" />
              </s-stack>
              <Text as="h2">{avgRating.toFixed(1)}</Text>
              <s-grid gridTemplateColumns="repeat(5, 20px)" alignItems="center">
                {stars.map((fillPercentage, idx) => (
                  <HalfStar key={idx} width={fillPercentage} color="#FF9500" />
                ))}
              </s-grid>
            </s-section>
          </s-box>
          {/* Avg. rating end */}
          {/* Requests sent start */}
          <s-box>
            <s-section>
              <s-stack
                direction="inline"
                gap="small"
                alignItems="center"
                justifyContent="space-between"
              >
                <s-heading> 
                  Requests sent {" "}
                  {!checkPricingPlan(
                    planState?.activePlan,
                    "pro-plan",
                    "plus-plan",
                    "unlimited",
                  ) && <PaidIcon />}
                </s-heading>
                <s-icon type="send" />
              </s-stack>
              <Text as="h2">{pendingOrders?.length ?? 0}</Text>
              <s-paragraph>Last 30 days</s-paragraph>
            </s-section>
          </s-box>
          {/* Requests sent end */}
          {/* Pending reviews start */}
          <s-box>
            <s-section>
              <s-stack
                direction="inline"
                gap="small"
                alignItems="center"
                justifyContent="space-between"
              >
                <s-heading>
                  Pending
                  {!checkPricingPlan(
                    planState?.activePlan,
                    "standard-plan",
                    "pro-plan",
                    "plus-plan",
                    "unlimited",
                  ) && <PaidIcon />}
                </s-heading>
                <s-icon type="clock" />
              </s-stack>
              <Text as="h2">{pendingReviews}</Text>
              <CustomText as="p" color={"#FF9500"}>
                Needs moderation
              </CustomText>
            </s-section>
          </s-box>
          {/* Pending reviews end */}
        </s-grid>
      </s-query-container>
    </s-stack>
  );
}
