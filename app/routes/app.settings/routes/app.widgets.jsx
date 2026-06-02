import CustomGridSection from "../../../components/essentials/CustomGridSection";
import CustomSection from "../../../components/essentials/CustomSection";
import Text from "../../../components/essentials/elements/Text";
export default function Widgets() {
  return (
    <>
      <s-stack
        paddingBlockEnd="base"
        direction="inline"
        alignItems="center"
        justifyContent="space-between"
      >
        <s-box>
          <Text>Widgets</Text>
          <s-text>Control how reviews are displayed on your storefront</s-text>
        </s-box>
        <s-button icon="app-extension" inline="fill" variant="secondary">
          Open theme editor
        </s-button>
      </s-stack>

      <s-section>
        {/* <s-stack padding="base" border="base" borderRadius="base">
                </s-stack> */}
        <CustomSection padding="0">
          <CustomGridSection
            heading="Review widget"
            description="The main review section displayed on product pages"
          >
            <CustomSection>
              <s-grid gap="small">
                <s-switch
                  label="Show review widget on product pages"
                  details="Displays the full review section below the product description"
                />
                <s-switch
                  label="Show star rating badge"
                  details="Displays average rating directly below the product title"
                />
                <s-switch
                  label="Show verified purchase badge"
                  details="Marks reviews from confirmed buyers with a verified label"
                />
                <s-switch
                  label="Show reviewer photos"
                  details="Display customer-uploaded photos within reviews"
                />
              </s-grid>
            </CustomSection>
          </CustomGridSection>
          <s-stack padding="base large base none">
            <s-divider />
          </s-stack>
          <CustomGridSection
            heading="Display options"
            description="Set the sorting and quantity you want to show on your storefront."
          >
            <CustomSection>
              <s-grid gap="small">
                <s-heading>Reviews per page </s-heading>
                <s-select>
                  <s-option>10 reviews</s-option>
                  <s-option>20 reviews</s-option>
                  <s-option>Custom amount</s-option>
                </s-select>
                <s-text>Custom review per page</s-text>
                <s-number-field defaultValue={20} onInput={() => {}} />
                <s-heading>Default sort order</s-heading>
                <s-select>
                  <s-option>Most recent</s-option>
                  <s-option>Highest rated</s-option>
                  <s-option>Most helpful</s-option>
                </s-select>
              </s-grid>
            </CustomSection>
          </CustomGridSection>
        </CustomSection>
      </s-section>
    </>
  );
}
