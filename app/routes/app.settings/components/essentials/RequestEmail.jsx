import CustomSection from "../../../../components/essentials/CustomSection";
import CustomGridSection from "../../../../components/essentials/CustomGridSection";
import { handleStateUpdate } from "../../utils/client/utils.client";

export default function RequestEmail({
  outgoingRequestEmail,
  setOutgoingRequestEmail,
}) {
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
              defaultValue={outgoingRequestEmail.requestEmailSubjectLine}
              onInput={(e) =>
                handleStateUpdate(
                  setOutgoingRequestEmail,
                  "requestEmailSubjectLine",
                  e.target.value,
                )
              }
              details={`Keep it short and friendly - avoid words like "feedback" which reduce open rates.`}
            />
            <s-divider />
            <s-heading>Email body message</s-heading>
            <s-text-area
              defaultValue={outgoingRequestEmail.requestEmailBody}
              onInput={(e) =>
                handleStateUpdate(
                  setOutgoingRequestEmail,
                  "requestEmailBody",
                  e.target.value,
                )
              }
              details={`Use {{variables}} to personalize your email.`}
            />
            <s-stack direction="inline" gap="small">
              <s-badge tone="neutral">{"{{first_name}}"}</s-badge>{" "}
              <s-badge tone="neutral">{"{{store_name}}"}</s-badge>{" "}
              <s-badge tone="neutral">{"{{product_name}}"}</s-badge>{" "}
              <s-badge tone="neutral">{"{{review_rating}}"}</s-badge>{" "}
            </s-stack>
            <s-divider />
            <s-heading>CTA button text</s-heading>
            <s-text-field
              defaultValue={outgoingRequestEmail.requestEmailButton}
              onInput={(e) =>
                handleStateUpdate(
                  setOutgoingRequestEmail,
                  "requestEmailButton",
                  e.target.value,
                )
              }
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
              onInput={(e) =>
                handleStateUpdate(
                  setOutgoingRequestEmail,
                  "reminderSubjectLine",
                  e.target.value,
                )
              }
              defaultValue={outgoingRequestEmail.reminderSubjectLine}
            />
            <s-divider />
            <s-heading>Email body</s-heading>
            <s-text-area
              defaultValue={outgoingRequestEmail.reminderEmailBody}
              details={`Use {{variables}} to personalize your email.`}
              onInput={(e) =>
                handleStateUpdate(
                  setOutgoingRequestEmail,
                  "reminderEmailBody",
                  e.target.value,
                )
              }
            />
            <s-stack direction="inline" gap="small">
              <s-badge tone="neutral">{"{{first_name}}"}</s-badge>{" "}
              <s-badge tone="neutral">{"{{store_name}}"}</s-badge>{" "}
              <s-badge tone="neutral">{"{{product_name}}"}</s-badge>{" "}
              <s-badge tone="neutral">{"{{review_rating}}"}</s-badge>{" "}
            </s-stack>
            <s-divider />

            <s-heading>CTA button text</s-heading>
            <s-text-field
              defaultValue={outgoingRequestEmail.reminderEmailButton}
              onInput={(e) =>
                handleStateUpdate(
                  setOutgoingRequestEmail,
                  "reminderEmailButton",
                  e.target.value,
                )
              }
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
              onInput={(e) =>
                handleStateUpdate(
                  setOutgoingRequestEmail,
                  "replyEmailSubjectLine",
                  e.target.value,
                )
              }
              defaultValue={outgoingRequestEmail.replyEmailSubjectLine}
            />
            <s-divider />
            <s-heading>Email body</s-heading>
            <s-text-area
              defaultValue={outgoingRequestEmail.replyEmailBody}
              details={`Use {{variables}} to personalize your email.`}
              onInput={(e) =>
                handleStateUpdate(
                  setOutgoingRequestEmail,
                  "replyEmailBody",
                  e.target.value,
                )
              }
            />
            <s-stack direction="inline" gap="small">
              <s-badge tone="neutral">{"{{first_name}}"}</s-badge>{" "}
              <s-badge tone="neutral">{"{{store_name}}"}</s-badge>{" "}
              <s-badge tone="neutral">{"{{product_name}}"}</s-badge>{" "}
              <s-badge tone="neutral">{"{{review_rating}}"}</s-badge>{" "}
            </s-stack>
            <s-divider />

            <s-heading>CTA button text</s-heading>
            <s-text-field
              defaultValue={outgoingRequestEmail.replyEmailButton}
              onInput={(e) =>
                handleStateUpdate(
                  setOutgoingRequestEmail,
                  "replyEmailButton",
                  e.target.value,
                )
              }
            />
          </s-grid>
        </CustomSection>
      </CustomGridSection>
    </CustomSection>
  );
}
