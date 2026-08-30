import { useLocation } from "react-router";
import PaidIcon from "../../../../components/essentials/PaidIcon";
import checkPricingPlan from "../../../../utils/checkPricingPlan"

export default function Clickable({ icon, title, url,planState }) {
  const { pathname } = useLocation();
  return (
    <s-clickable
      href={url}
      paddingInline="small"
      paddingBlock="small-200"
      background={pathname == url ? "subdued" : "base"}
      borderRadius="base"
    >
      <s-stack direction="inline" gap="small">
        <s-icon type={icon} />
        <s-text>{title}
          {!checkPricingPlan(
                planState.activePlan,
                title == "Publishing & moderation"
                  ? "standard-plan"
                  : "pro-plan",
              ) && <PaidIcon />}
        </s-text>
      </s-stack>
    </s-clickable>
  );
}
