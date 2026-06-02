import CustomGridSection from "../../../components/essentials/CustomGridSection";
import CustomSection from "../../../components/essentials/CustomSection";
import Text from "../../../components/essentials/elements/Text";
export default function AdminNotification() {
  return (
    <>
      <s-stack
        paddingBlockEnd="base"
        direction="inline"
        alignItems="center"
        justifyContent="space-between"
      >
        <s-box>
          <Text>Admin notifications</Text>
          <s-text>
            Choose when Qorix sends you an email about review activity
          </s-text>
        </s-box>
      </s-stack>

      <s-section>
        {/* <s-stack padding="base" border="base" borderRadius="base">
                  </s-stack> */}
        <CustomSection padding="0">
          <CustomGridSection
            heading="Notification email address"
            description="All admin notifications are sent to this email"
          >
            <CustomSection>
              <s-grid gap="small">
                <s-heading>Email address</s-heading>
                <s-text-field
                  defaultValue="svaomegaprime@gmail.com"
                  details="This is your store's admin email. You can change it at any time."
                  disabled
                />
                <s-text-field defaultValue="svaomegaprime@gmail.com" />
                <s-text-field defaultValue="svaomegaprime@gmail.com" />
                <s-divider />
                <s-button icon="email" variant="secondary">
                  Add email (max 3)
                </s-button>
              </s-grid>
            </CustomSection>
          </CustomGridSection>
          <s-stack padding="base large base none">
            <s-divider />
          </s-stack>
          <CustomGridSection
            heading="Notification events"
            description="Select which events trigger an email notification to you"
          >
            <CustomSection>
              <s-grid gap="small">
                <s-switch
                  label="New review received"
                  details="Notify when any customer submits a review"
                />
                <s-switch
                  label="Review needs moderation"
                  details="Notify when a review is held for your approval"
                />
                <s-switch
                  label="Low star review alert"
                  details="Notify when a 1 or 2 star review is received"
                />
                <s-switch
                  label="Weekly summary"
                  details="Get a weekly digest of reviews, requests and ratings"
                />
              </s-grid>
            </CustomSection>
          </CustomGridSection>
          <s-stack padding="base large base none">
            <s-divider />
          </s-stack>
          <CustomGridSection
            heading="Notification frequency"
            description="Control how often you receive new review notifications"
          >
            <CustomSection>
              <s-grid gap="small">
                <s-heading>New review notification</s-heading>

                <s-select details="Immediate alerts are best if you moderate reviews manually">
                  <s-option>Send immediately</s-option>
                  <s-option>Daily digest</s-option>
                  <s-option>Weekly digest </s-option>
                </s-select>
              </s-grid>
            </CustomSection>
          </CustomGridSection>
        </CustomSection>
      </s-section>
    </>
  );
}
