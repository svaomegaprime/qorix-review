import ProgressiveBar from "./ProgressiveBar";
export default function ReviewPipeItem({
  starFor = 5,
  totalReviews = 14,
  earnedReviews = 4,
}) {
  return (
    <s-grid
      gridTemplateColumns="4px 55px 24px"
      justifyContent="end"
      alignItems="center"
      gap="small"
    >
      <s-paragraph color="subdued">{starFor}</s-paragraph>
      <ProgressiveBar
        step={earnedReviews}
        totalSteps={totalReviews}
        visibleHeader={false}
        placeholdColor="#ff950033"
        fillColor="#ff9500"
      />
      <s-paragraph color="subdued">{earnedReviews}</s-paragraph>
    </s-grid>
  );
}
