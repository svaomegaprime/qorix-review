import CustomSection from "../../../../components/essentials/CustomSection";
import CustomGridSection from "../../../../components/essentials/CustomGridSection";

export default function RequestEmail({ emailSettings, onChange }) {
  const handleInputChange = (field) => (e) => {
    onChange(field, e.target.value);
  };

  return (
    <CustomSection padding="0">
      <CustomGridSection
        heading="Request email content"
        description="Customize what customers see in their review request."
      >
        <CustomSection>
          <s-grid gap="small">
            <s-heading>Email subject line</s-heading>
            <s-text-field
              value={emailSettings.requestEmailSubjectLine}
              onInput={handleInputChange("requestEmailSubjectLine")}
              details={`Keep it short and friendly - avoid words like "feedback" which reduce open rates.`}
            />
            <s-divider />
            <s-heading>Email body message</s-heading>
            <s-text-area
              value={emailSettings.requestEmailBody}
              onInput={handleInputChange("requestEmailBody")}
              details={`Use {{variables}} to personalize your email.`}
            />
            <s-stack direction="inline" gap="small">
              <s-badge tone="neutral">{"{{first_name}}"}</s-badge>{" "}
              <s-badge tone="neutral">{"{{store_name}}"}</s-badge>{" "}
              <s-badge tone="neutral">{"{{product_name}}"}</s-badge>{" "}
              {/* <s-badge tone="neutral">{"{{review_rating}}"}</s-badge>{" "} */}
            </s-stack>
            <s-divider />
            <s-heading>CTA button text</s-heading>
            <s-text-field
              value={emailSettings.requestEmailButton}
              onInput={handleInputChange("requestEmailButton")}
              details={`Action-oriented text converts better - e.g. "Leave a review" not "Click here"`}
            />
          </s-grid>
        </CustomSection>
      </CustomGridSection>
      <s-stack padding="base large base none">
        <s-divider />
      </s-stack>
      <CustomGridSection
        heading="Reminder email"
        description="Sent if the customer didn't respond to the first request"
      >
        <CustomSection>
          <s-grid gap="small">
            <s-heading>Subject line</s-heading>
            <s-text-field
              value={emailSettings.reminderSubjectLine}
              onInput={handleInputChange("reminderSubjectLine")}
            />
            <s-divider />
            <s-heading>Email body</s-heading>
            <s-text-area
              value={emailSettings.reminderEmailBody}
              details={`Use {{variables}} to personalize your email.`}
              onInput={handleInputChange("reminderEmailBody")}
            />
            <s-stack direction="inline" gap="small">
              <s-badge tone="neutral">{"{{first_name}}"}</s-badge>{" "}
              <s-badge tone="neutral">{"{{store_name}}"}</s-badge>{" "}
              <s-badge tone="neutral">{"{{product_name}}"}</s-badge>{" "}
              {/* <s-badge tone="neutral">{"{{review_rating}}"}</s-badge>{" "} */}
            </s-stack>
            <s-divider />

            <s-heading>CTA button text</s-heading>
            <s-text-field
              value={emailSettings.reminderEmailButton}
              onInput={handleInputChange("reminderEmailButton")}
            />
          </s-grid>
        </CustomSection>
      </CustomGridSection>
      <s-stack padding="base large base none">
        <s-divider />
      </s-stack>
      <CustomGridSection
        heading="Reply Email"
        description="Sent if the merchant sent a reply"
      >
        <CustomSection>
          <s-grid gap="small">
            <s-heading>Subject line</s-heading>
            <s-text-field
              value={emailSettings.replyEmailSubjectLine}
              onInput={handleInputChange("replyEmailSubjectLine")}
            />
            <s-divider />
            <s-heading>Email body</s-heading>
            <s-text-area
              value={emailSettings.replyEmailBody}
              details={`Use {{variables}} to personalize your email.`}
              onInput={handleInputChange("replyEmailBody")}
            />
            <s-stack direction="inline" gap="small">
              <s-badge tone="neutral">{"{{first_name}}"}</s-badge>{" "}
              <s-badge tone="neutral">{"{{store_name}}"}</s-badge>{" "}
              <s-badge tone="neutral">{"{{product_name}}"}</s-badge>{" "}
              {/* <s-badge tone="neutral">{"{{review_rating}}"}</s-badge>{" "} */}
            </s-stack>
            <s-divider />

            <s-heading>CTA button text</s-heading>
            <s-text-field
              value={emailSettings.replyEmailButton}
              onInput={handleInputChange("replyEmailButton")}
            />
          </s-grid>
        </CustomSection>
      </CustomGridSection>
    </CustomSection>
  );
}
