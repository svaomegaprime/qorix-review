import CustomSection from "../../../../components/essentials/CustomSection";
import CustomGridSection from "../../../../components/essentials/CustomGridSection";
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
              defaultValue="How did we do? Share your thoughts ⭐"
              onInput={(e) =>
                setOutgoingRequestEmail((pre) => ({
                  ...pre,
                  requestEmailSubjectLine: e.target.value,
                }))
              }
              details={`Keep it short and friendly — avoid words like "feedback" which reduce open rates.`}
            />
            <s-heading>Email body message</s-heading>
            <s-text-area
              defaultValue="Hi {{first_name}}, thank you for your recent order! We'd love to hear what you think. It only takes 30 seconds."
              onInput={(e) =>
                setOutgoingRequestEmail((pre) => ({
                  ...pre,
                  requestEmailBody: e.target.value,
                }))
              }
              details={`Use {{first_name}} to personalize. Keep it under 3 sentences for best results.`}
            />
            <s-heading>CTA button text</s-heading>
            <s-text-field
              defaultValue="Leave a review →"
              onInput={(e) =>
                setOutgoingRequestEmail((pre) => ({
                  ...pre,
                  requestEmailButton: e.target.value,
                }))
              }
              details={`Action-oriented text converts better — e.g. "Leave a review" not "Click here"`}
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
                setOutgoingRequestEmail((pre) => ({
                  ...pre,
                  reminderSubjectLine: e.target.value,
                }))
              }
              defaultValue="Still time to share your thoughts ✍️"
            />
            <s-heading>Email body</s-heading>
            <s-text-area
              defaultValue="Hi {{first_name}}, we noticed you haven't had a chance to leave a review yet. We'd really appreciate your feedback!"
              onInput={(e) =>
                setOutgoingRequestEmail((pre) => ({
                  ...pre,
                  reminderEmailBody: e.target.value,
                }))
              }
            />
            <s-heading>CTA button text</s-heading>
            <s-text-field
              defaultValue="Write my review →"
              onInput={(e) =>
                setOutgoingRequestEmail((pre) => ({
                  ...pre,
                  reminderEmailButton: e.target.value,
                }))
              }
            />
          </s-grid>
        </CustomSection>
      </CustomGridSection>
    </CustomSection>
  );
}
