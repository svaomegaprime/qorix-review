const PLAN_HIERARCHY = ["standard", "pro-plan", "plus-plan", "unlimited"];

export default function checkPricingPlan(activePlan, ...requiredPlans) {
  const activePlanIndex = PLAN_HIERARCHY.indexOf(activePlan);

  return requiredPlans.some((plan) => {
    const requiredPlanIndex = PLAN_HIERARCHY.indexOf(plan);

    return activePlanIndex >= requiredPlanIndex;
  });
}
