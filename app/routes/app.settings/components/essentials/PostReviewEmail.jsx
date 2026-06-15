import CustomSection from "../../../../components/essentials/CustomSection";
import CustomGridSection from "../../../../components/essentials/CustomGridSection";

export default function PostReviewEmail({
  postReviewEmail,
  setPostReviewEmail,
}) {
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
                defaultChecked={postReviewEmail.isConfirmationReviewEmail}
                onChange={(e) =>
                  setPostReviewEmail((pre) => ({
                    ...pre,
                    isConfirmationReviewEmail: e.target.checked,
                  }))
                }
                label="Enable review confirmation email"
                details="Let customers know their review was received"
              />
              <s-button variant="secondary" icon="eye-check-mark">
                Preview
              </s-button>
            </s-grid>
            <s-divider />
            <s-heading>Email subject line</s-heading>
            <s-text-field
              defaultValue="Thanks for your review! 🙏"
              onInput={(e) =>
                setPostReviewEmail((pre) => ({
                  ...pre,
                  confirmationEmailSubject: e.target.value,
                }))
              }
            />
            <s-divider />
            <s-heading>Email body message</s-heading>
            <s-text-area
              defaultValue="Hi {{first_name}}, your review has been received. We really appreciate you taking the time!"
              onInput={(e) =>
                setPostReviewEmail((pre) => ({
                  ...pre,
                  confirmationEmailBody: e.target.value,
                }))
              }
              details="Use {{variables}} to personalize your email."
            />
            <s-stack direction="inline" gap="small">
              <s-badge tone="neutral">{"{{first_name}}"}</s-badge>{" "}
              <s-badge tone="neutral">{"{{store_name}}"}</s-badge>{" "}
              <s-badge tone="neutral">{"{{product_name}}"}</s-badge>{" "}
              <s-badge tone="neutral">{"{{review_rating}}"}</s-badge>{" "}
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
              defaultChecked={postReviewEmail.isReplyReviewEmail}
              onChange={(e) =>
                setPostReviewEmail((pre) => ({
                  ...pre,
                  isReplyReviewEmail: e.target.checked,
                }))
              }
              label="Enable review confirmation email"
              details="Let customers know their review was received"
            ></s-switch>
            <s-heading>Subject line</s-heading>
            <s-text-field
              defaultValue="The store replied to your review 💬"
              onInput={(e) =>
                setPostReviewEmail((pre) => ({
                  ...pre,
                  replyReviewEmailSubject: e.target.value,
                }))
              }
            />
          </s-grid>
        </CustomSection>
      </CustomGridSection>
    </CustomSection>
  );
}
