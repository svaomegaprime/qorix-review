const PLAN_HIERARCHY = ["standard-plan", "pro-plan", "plus-plan", "unlimited"];

export default function checkPricingPlan(activePlan, ...requiredPlans) {
  if (!activePlan) return false;
  const activePlanIndex = PLAN_HIERARCHY.indexOf(activePlan);

  return requiredPlans.some((plan) => {
    const requiredPlanIndex = PLAN_HIERARCHY.indexOf(plan);

    return activePlanIndex >= requiredPlanIndex;
  });
}
