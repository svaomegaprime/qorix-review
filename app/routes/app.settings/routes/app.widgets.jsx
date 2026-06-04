import { useState } from "react";
import CustomGridSection from "../../../components/essentials/CustomGridSection";
import CustomSection from "../../../components/essentials/CustomSection";
import Text from "../../../components/essentials/elements/Text";
import { DEFAULT_WIDGET } from "../data/defaultData";
import { handleStateUpdate } from "../utils/client/utils.client";
export default function Widgets() {
  const [widgetSettings, setWidgetSettings] = useState(DEFAULT_WIDGET);
  const [customReviewPerPage, setCustomReviewPerPage] = useState({
    isCustomReviewPerPage: false,
  });
  return (
    <>
      {/* <pre>{JSON.stringify(widgetSettings, null, 2)}</pre> */}

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
                  defaultChecked={widgetSettings.isShowWidgetOnProductPage}
                  onInput={(e) =>
                    handleStateUpdate(
                      setWidgetSettings,
                      "isShowWidgetOnProductPage",
                      e.target.checked,
                    )
                  }
                  label="Show review widget on product pages"
                  details="Displays the full review section below the product description"
                />
                <s-switch
                  defaultChecked={widgetSettings.isShowStarRatingBadge}
                  onInput={(e) =>
                    handleStateUpdate(
                      setWidgetSettings,
                      "isShowStarRatingBadge",
                      e.target.checked,
                    )
                  }
                  label="Show star rating badge"
                  details="Displays average rating directly below the product title"
                />
                <s-switch
                  defaultChecked={widgetSettings.isShowVerifiedPurchaseBadge}
                  onInput={(e) =>
                    handleStateUpdate(
                      setWidgetSettings,
                      "isShowVerifiedPurchaseBadge",
                      e.target.checked,
                    )
                  }
                  label="Show verified purchase badge"
                  details="Marks reviews from confirmed buyers with a verified label"
                />
                <s-switch
                  defaultChecked={widgetSettings.isShowReviewerPhotos}
                  onInput={(e) =>
                    handleStateUpdate(
                      setWidgetSettings,
                      "isShowReviewerPhotos",
                      e.target.checked,
                    )
                  }
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
                <s-select
                  onChange={(e) => {
                    const isCustom = e.target.value == "CUSTOM";
                    !isCustom &&
                      handleStateUpdate(
                        setWidgetSettings,
                        "reviewsPerPage",
                        Number(e.target.value),
                      );

                    isCustom
                      ? setCustomReviewPerPage((pre) => ({
                          ...pre,
                          isCustomReviewPerPage: true,
                        }))
                      : setCustomReviewPerPage((pre) => ({
                          ...pre,
                          isCustomReviewPerPage: false,
                        }));
                  }}
                >
                  <s-option value="10">10 reviews</s-option>
                  <s-option value="20">20 reviews</s-option>
                  <s-option value="CUSTOM">Custom amount</s-option>
                </s-select>
                {customReviewPerPage.isCustomReviewPerPage && (
                  <>
                    <s-text>Custom review per page</s-text>
                    <s-number-field
                      defaultValue={widgetSettings.reviewsPerPage}
                      onInput={(e) => {
                        handleStateUpdate(
                          setWidgetSettings,
                          "reviewsPerPage",
                          Number(e.target.value),
                        );
                      }}
                    />
                  </>
                )}
                <s-heading>Default sort order</s-heading>
                <s-select
                  onChange={(e) =>
                    handleStateUpdate(
                      setWidgetSettings,
                      "reviewSortOrder",
                      e.target.value,
                    )
                  }
                >
                  <s-option value="RECENT">Most recent</s-option>
                  <s-option value="RATED">Highest rated</s-option>
                  <s-option value="HELPFUL">Most helpful</s-option>
                </s-select>
              </s-grid>
            </CustomSection>
          </CustomGridSection>
        </CustomSection>
      </s-section>
    </>
  );
}
