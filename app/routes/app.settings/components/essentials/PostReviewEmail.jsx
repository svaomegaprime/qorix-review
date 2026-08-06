import CustomSection from "../../../../components/essentials/CustomSection";
import CustomGridSection from "../../../../components/essentials/CustomGridSection";

export default function PostReviewEmail({ emailSettings, onChange }) {
  const handleBooleanChange = (field) => (e) => {
    onChange(field, e.target.checked);
  };

  const handleInputChange = (field) => (e) => {
    onChange(field, e.target.value);
  };

  return (
    <CustomSection padding="0">
      <CustomGridSection
        heading="Review confirmation"
        description="Sent to the customer after they successfully submit a review"
      >
        <CustomSection>
          <s-grid gap="small">
            <s-grid gridTemplateColumns="1fr auto" alignItems="start">
              <s-switch
                checked={emailSettings.isConfirmationReviewEmail}
                onChange={handleBooleanChange("isConfirmationReviewEmail")}
                label="Enable review confirmation email"
                details="Let customers know their review was received"
              />
              {/* <s-button variant="secondary" icon="eye-check-mark">
                Preview
              </s-button> */}
            </s-grid>
            <s-divider />
            <s-heading>Email subject line</s-heading>
            <s-text-field
              value={emailSettings.confirmationEmailSubject}
              onInput={handleInputChange("confirmationEmailSubject")}
            />
            <s-divider />
            <s-heading>Email body message</s-heading>
            <s-text-area
              value={emailSettings.confirmationEmailBody}
              onInput={handleInputChange("confirmationEmailBody")}
              details="Use {{variables}} to personalize your email."
            />
            <s-stack direction="inline" gap="small">
              <s-badge tone="neutral">{"{{first_name}}"}</s-badge>{" "}
              <s-badge tone="neutral">{"{{store_name}}"}</s-badge>{" "}
              <s-badge tone="neutral">{"{{product_name}}"}</s-badge>{" "}
              {/* <s-badge tone="neutral">{"{{review_rating}}"}</s-badge>{" "} */}
            </s-stack>
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
              checked={emailSettings.isReplyReviewEmail}
              onChange={handleBooleanChange("isReplyReviewEmail")}
              label="Enable reply notification email"
              details="Let customers know when you reply to their review"
            ></s-switch>
            {/* <s-heading>Subject line</s-heading> */}
            {/* <s-text-field
              value={emailSettings.replyReviewEmailSubject}
              onInput={handleInputChange("replyReviewEmailSubject")}
            /> */}
          </s-grid>
        </CustomSection>
      </CustomGridSection>
    </CustomSection>
  );
}
