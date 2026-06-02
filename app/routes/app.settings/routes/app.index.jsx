import CustomGridSection from "../../../components/essentials/CustomGridSection";
import CustomSection from "../../../components/essentials/CustomSection";
import Text from "../../../components/essentials/elements/Text";
export default function Settings() {
  return (
    <>
      <s-stack
        paddingBlockEnd="base"
        direction="inline"
        alignItems="center"
        justifyContent="space-between"
      >
        <s-box>
          <Text>Request reviews</Text>
          <s-text>
            Send review request emails to customers after delivery
          </s-text>
        </s-box>
        <s-button inline="fill" variant="secondary">
          View review requests
        </s-button>
      </s-stack>

      <s-section>
        {/* <s-stack padding="base" border="base" borderRadius="base">
                </s-stack> */}
        <CustomSection padding="0">
          <CustomGridSection
            heading="Automatic review requests"
            description="Send review request emails to customers after delivery"
          >
            <CustomSection>
              <s-grid gap="small">
                <s-switch
                  label="Enable automatic requests"
                  details="Customers receive a review request email automatically after their order is delivered"
                ></s-switch>

                <s-divider />
                <s-stack>
                  <s-heading>Send request</s-heading>
                  <s-paragraph color="subdued">
                    Days after the order is marked as delivered
                  </s-paragraph>
                  <s-box paddingBlock="small">
                    <s-select>
                      <s-option>5 days after delivery</s-option>
                      <s-option>7 days after delivery</s-option>
                      <s-option>15 days after delivery</s-option>
                      <s-option>Add custom days</s-option>
                    </s-select>
                  </s-box>
                  <s-number-field
                    label="Custom days"
                    onInput={(e) => console.log(e.currentTarget.value)}
                  />
                </s-stack>
                <s-divider />

                <s-stack>
                  <s-switch
                    label="Send reminder if no response"
                    details="Follow-up email if customer hasn't reviewed after the first request"
                  ></s-switch>
                </s-stack>
                <s-divider />

                <s-stack>
                  <s-heading>Reminder delay</s-heading>
                  <s-paragraph color="subdued">
                    Days after first request to send the reminder
                  </s-paragraph>
                  <s-box paddingBlock="small">
                    <s-select>
                      <s-option>5 days later</s-option>
                      <s-option>7 days later</s-option>
                      <s-option>10 days later</s-option>
                      <s-option>15 days later</s-option>
                    </s-select>
                  </s-box>
                  <s-number-field
                    label="Custom days"
                    onInput={(e) => console.log(e.currentTarget.value)}
                  />
                </s-stack>
              </s-grid>
            </CustomSection>
          </CustomGridSection>
          <s-stack padding="base large base none">
            <s-divider />
          </s-stack>
          {/* <CustomGridSection
            heading="Request email content"
            description="Customize what customers see in their review request."
          >
            <CustomSection>
              <s-grid gap="small">
                <s-heading>Email subject line</s-heading>
                <s-text-field
                  defaultValue="How did we do? Share your thoughts ⭐"
                  onInput={() => {}}
                  details={`Keep it short and friendly — avoid words like "feedback" which reduce open rates.`}
                />
                <s-heading>Email body message</s-heading>
                <s-text-area
                  defaultValue="Hi {{first_name}}, thank you for your recent order! We'd love to hear what you think. It only takes 30 seconds."
                  onInput={() => {}}
                  details={`Use {{first_name}} to personalize. Keep it under 3 sentences for best results.`}
                />
                <s-heading>CTA button text</s-heading>
                <s-text-field
                  defaultValue="Leave a review →"
                  onInput={() => {}}
                  details={`Action-oriented text converts better — e.g. "Leave a review" not "Click here"`}
                />
              </s-grid>
            </CustomSection>
          </CustomGridSection>
          <s-stack padding="base none base none">
            <s-divider />
          </s-stack> */}
          <CustomGridSection
            heading="Request exclusions"
            description="Orders that should never receive a review request."
          >
            <CustomSection>
              <s-grid gap="small">
                <s-switch
                  label="Skip refunded orders"
                  details="Don't send requests for orders that were fully refunded"
                ></s-switch>
                <s-switch
                  label="Skip cancelled orders"
                  details="Don't send requests for orders that were cancelled"
                ></s-switch>
                <CustomSection>
                  <s-grid gridTemplateColumns="1fr 120px">
                    <s-box>
                      <s-heading>Minimum order value</s-heading>
                      <s-paragraph color="subdued">
                        Only send requests for orders above this amount (0 = all
                        orders)
                      </s-paragraph>
                    </s-box>
                    <s-select>
                      <s-option>0 USD</s-option>
                      <s-option>100 USD</s-option>
                      <s-option>500 USD</s-option>
                      <s-option>1000 USD</s-option>
                    </s-select>
                  </s-grid>
                </CustomSection>
              </s-grid>
            </CustomSection>
          </CustomGridSection>
        </CustomSection>
      </s-section>
    </>
  );
}
