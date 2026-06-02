import CustomGridSection from "../../../components/essentials/CustomGridSection";
import CustomSection from "../../../components/essentials/CustomSection";
import Text from "../../../components/essentials/elements/Text";
export default function Branding() {
  return (
    <>
      <s-stack
        paddingBlockEnd="base"
        direction="inline"
        alignItems="center"
        justifyContent="space-between"
      >
        <s-box>
          <Text>Branding</Text>
          <s-text>
            Customise your logo and brand appearance in review emails
          </s-text>
        </s-box>
        <s-button icon="app-extension" inline="fill" variant="secondary">
          Preview email
        </s-button>
      </s-stack>

      <s-section>
        {/* <s-stack padding="base" border="base" borderRadius="base">
                </s-stack> */}
        <CustomSection padding="0">
          <CustomGridSection
            heading="Store logo"
            description="Appears in the header of all review request and notification emails"
          >
            <CustomSection>
              <s-grid gap="small">
                <s-drop-zone
                  label="Recommended 240*80px. Maximum file size: 2MB (500KB recommended)."
                  accessibilityLabel="Upload image of type jpg, png, or gif"
                  accept=".jpg,.png,.gif"
                  multiple
                  onInput="console.log('onInput', event.currentTarget?.value)"
                  onChange="console.log('onChange', event.currentTarget?.value)"
                  onDropRejected="console.log('onDropRejected', event.currentTarget?.value)"
                ></s-drop-zone>
              </s-grid>
            </CustomSection>
          </CustomGridSection>
          <s-stack padding="base large base none">
            <s-divider />
          </s-stack>
          <CustomGridSection
            heading="Brand color"
            description="Used as the CTA button color in review request emails."
          >
            <CustomSection>
              <s-grid gap="small">
                <s-heading>Primary color</s-heading>
                <s-color-field
                  defaultValue="#001555"
                  details={`This color appears on the "Leave a review" button in your emails`}
                />
              </s-grid>
            </CustomSection>
          </CustomGridSection>
          <s-stack padding="base large base none">
            <s-divider />
          </s-stack>
          <CustomGridSection
            heading="Sender name"
            description="The name customers see in their inbox when receiving review emails"
          >
            <CustomSection>
              <s-grid gap="small">
                <s-heading>From name</s-heading>
                <s-text-field
                  defaultValue="Osman store"
                  details={`Shown as "From: Osman store" in the customer's inbox`}
                />
              </s-grid>
            </CustomSection>
          </CustomGridSection>
        </CustomSection>
      </s-section>
    </>
  );
}
