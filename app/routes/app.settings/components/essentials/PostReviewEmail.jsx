import CustomSection from "../../../../components/essentials/CustomSection";
import CustomGridSection from "../../../../components/essentials/CustomGridSection";

export default function PostReviewEmail() {
  return (
    <CustomSection padding="0">
      <CustomGridSection
        heading="Review confirmation"
        description="Sent to the customer after they successfully submit a review"
      >
        <CustomSection>
          <s-grid gap="small">
            <s-switch
              label="Enable review confirmation email"
              details="Let customers know their review was received"
            ></s-switch>
            <s-heading>Email subject line</s-heading>
            <s-text-field
              defaultValue="Thanks for your review! 🙏"
              onInput={() => {}}
            />
            <s-heading>Email body message</s-heading>
            <s-text-area
              defaultValue="Hi {{first_name}}, your review has been received. We really appreciate you taking the time!"
              onInput={() => {}}
            />
          </s-grid>
        </CustomSection>
      </CustomGridSection>
      <s-stack padding="base large base none">
        <s-divider />
      </s-stack>
      <CustomGridSection
        heading="Reply notification"
        description="Sent to the customer when you reply to their review"
      >
        <CustomSection>
          <s-grid gap="small">
            <s-switch
              label="Enable review confirmation email"
              details="Let customers know their review was received"
            ></s-switch>
            <s-heading>Subject line</s-heading>
            <s-text-field
              defaultValue="The store replied to your review 💬"
              onInput={() => {}}
            />
          </s-grid>
        </CustomSection>
      </CustomGridSection>
    </CustomSection>
  );
}
