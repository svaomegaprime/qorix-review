import { useState, useEffect } from "react";
import CustomGridSection from "../../../components/essentials/CustomGridSection";
import CustomSection from "../../../components/essentials/CustomSection";
import Text from "../../../components/essentials/elements/Text";
import selectedImage from "../../../assets/images/selected.png";
import { DEFAULT_WIDGET } from "../data/defaultData";
import { handleStateUpdate } from "../utils/client/utils.client";
import Range from "../../app.widgets/components/elements/Range";
import { useFetcher, useLoaderData } from "react-router";
import { authenticate } from "../../../shopify.server";
import prisma from "../../../db.server";

import { getStoreData } from "../../../utils/getStoreData";
import { adminErrorResponse } from "../../../utils/adminError.server";
import { useAdminFetcherToast } from "../../../utils/useAdminFetcherToast";

export async function loader({ request }) {
  try {
    const { admin, session } = await authenticate.admin(request);
    const { id } = await getStoreData(admin);

    const storeSettings = await prisma.storeSettings.findFirst({
      where: {
        storeId: id,
      },
      include: {
        widgetsSettings: true,
      },
    });

    return { storeSettings };
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function action({ request }) {
  try {
    const { admin, session } = await authenticate.admin(request);

    const data = await request.json();
    // const { id } = await getStoreData(admin);

    const widgetsSettingsData = await prisma.widgetsSettings.update({
      where: {
        id: data.id,
      },
      data,
    });

    return {
      ok: true,
      message: "upserted PublishingModerationData",
    };
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export default function Widgets() {
  const { storeSettings } = useLoaderData();
  const fetcher = useFetcher();
  useAdminFetcherToast(fetcher);
  const [widgetSettings, setWidgetSettings] = useState(
    storeSettings.widgetsSettings ?? DEFAULT_WIDGET,
  );
  const [customReviewPerPage, setCustomReviewPerPage] = useState({
    isCustomReviewPerPage: false,
  });

  useEffect(() => {
    const hasChanged =
      JSON.stringify(widgetSettings) !==
      JSON.stringify(storeSettings?.widgetsSettings);

    if (hasChanged) {
      shopify.saveBar.show("leave-confirm-save-bar");
    } else {
      shopify.saveBar.hide("leave-confirm-save-bar");
    }
  }, [widgetSettings]);

  function handleSave() {
    fetcher.submit(widgetSettings, {
      method: "POST",
      encType: "application/json",
    });
  }

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) {
      // Save successful
      shopify.saveBar.hide("leave-confirm-save-bar");
    }
  }, [fetcher.state, fetcher.data]);

  const [formResetKey, setFormResetKey] = useState(0);

  function handleDiscard() {
    setWidgetSettings(storeSettings.widgetsSettings ?? DEFAULT_WIDGET);
    setCustomReviewPerPage({
      isCustomReviewPerPage: false,
    });
    setFormResetKey((pre) => pre + 1);
    shopify.saveBar.hide("leave-confirm-save-bar");
  }

  return (
    <>
      <pre>{JSON.stringify(widgetSettings, null, 2)}</pre>

      <ui-save-bar id="leave-confirm-save-bar">
        <button onClick={handleSave} variant="primary" id="save-button">
          Save
        </button>
        <button onClick={handleDiscard} id="discard-button">
          Discard
        </button>
      </ui-save-bar>
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

      <s-section key={formResetKey}>
        <CustomSection padding="0">
          <CustomGridSection
            heading="Global display default"
            description="These defaults apply across all widgets unless changed in individual widget settings."
          >
            <CustomSection>
              <s-grid gap="small">
                <s-grid gridTemplateColumns="1fr 1fr" direction="inline">
                  <s-box>
                    <s-heading>Default star color</s-heading>
                    <s-paragraph color="subdued">
                      Star color used in all widgets
                    </s-paragraph>
                  </s-box>
                  <s-color-field
                    onChange={(e) =>
                      handleStateUpdate(
                        setWidgetSettings,
                        "defaultStarColor",
                        e.target.value,
                      )
                    }
                    defaultValue={widgetSettings.defaultStarColor}
                  />
                </s-grid>
                <s-divider />
                <s-grid gridTemplateColumns="1fr 1fr" direction="inline">
                  <s-box>
                    <s-heading>Default font size </s-heading>
                    <s-paragraph color="subdued">
                      Default text size for widget content.
                    </s-paragraph>
                  </s-box>
                  <CustomSection padding="small">
                    <Range
                      onChange={(e) =>
                        handleStateUpdate(
                          setWidgetSettings,
                          "defaultFontSize",
                          e.target.value + "px",
                        )
                      }
                      defaultValue={10}
                      max={50}
                    />
                  </CustomSection>
                </s-grid>
                <s-divider />
                <s-grid
                  gridTemplateColumns="1fr 1fr"
                  direction="inline"
                  alignItems="center"
                >
                  <s-box>
                    <s-heading>Default border radius </s-heading>
                    <s-paragraph color="subdued">
                      Corner rounding for all widget cards.
                    </s-paragraph>
                  </s-box>
                  <CustomSection padding="small">
                    <Range
                      onChange={(e) =>
                        handleStateUpdate(
                          setWidgetSettings,
                          "defaultBorderRadius",
                          e.target.value + "px",
                        )
                      }
                      defaultValue={10}
                      max={50}
                    />
                  </CustomSection>
                </s-grid>
                <s-divider />
                <s-stack
                  alignItems="center"
                  direction="inline"
                  justifyContent="space-between"
                >
                  <s-box>
                    <s-heading>Show verified badge</s-heading>
                    <s-paragraph color="subdued">
                      Display verified purchase badge everywhere.
                    </s-paragraph>
                  </s-box>
                  <s-switch
                    onChange={(e) =>
                      handleStateUpdate(
                        setWidgetSettings,
                        "isShowVerifiedBadge",
                        e.target.checked,
                      )
                    }
                    defaultChecked={widgetSettings.isShowVerifiedBadge}
                  />
                </s-stack>
                <s-divider />
                <s-stack
                  alignItems="center"
                  direction="inline"
                  justifyContent="space-between"
                >
                  <s-box>
                    <s-heading>Show reviewer name</s-heading>
                    <s-paragraph color="subdued">
                      Display reviewer’s name in all widgets.
                    </s-paragraph>
                  </s-box>
                  <s-switch
                    onChange={(e) =>
                      handleStateUpdate(
                        setWidgetSettings,
                        "isShowReviewerName",
                        e.target.checked,
                      )
                    }
                    defaultChecked={widgetSettings.isShowReviewerName}
                  />
                </s-stack>
                <s-divider />
                <s-stack
                  alignItems="center"
                  direction="inline"
                  justifyContent="space-between"
                >
                  <s-box>
                    <s-heading>Show review date</s-heading>
                    <s-paragraph color="subdued">
                      Display review date in all widgets.
                    </s-paragraph>
                  </s-box>
                  <s-switch
                    onChange={(e) =>
                      handleStateUpdate(
                        setWidgetSettings,
                        "isShowReviewerDate",
                        e.target.checked,
                      )
                    }
                    defaultChecked={widgetSettings.isShowReviewerDate}
                  />
                </s-stack>
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
                <s-divider />
                <s-heading>Minimum star rating to display</s-heading>
                <s-select
                  onChange={(e) =>
                    handleStateUpdate(
                      setWidgetSettings,
                      "minimumStarRatingToDisplay",
                      e.target.value,
                    )
                  }
                >
                  <s-option value="ALL_RATINGS">Show all ratings</s-option>
                  <s-option value="ONE_STAR">1 star and above</s-option>
                  <s-option value="TWO_STAR">2 star and above</s-option>
                  <s-option value="THREE_STAR">3 star and above</s-option>
                  <s-option value="FOUR_STAR">4 star and above</s-option>
                  <s-option value="FIVE_STAR">5 star and above</s-option>
                </s-select>
                <s-divider />
                <s-stack
                  alignItems="center"
                  direction="inline"
                  justifyContent="space-between"
                >
                  <s-box>
                    <s-heading>Show reviews with media first</s-heading>
                    <s-paragraph color="subdued">
                      Photo and video reviews will appear at the top
                    </s-paragraph>
                  </s-box>
                  <s-switch
                    defaultChecked={widgetSettings.isShowMediaFirst}
                    onChange={(e) =>
                      handleStateUpdate(
                        setWidgetSettings,
                        "isShowMediaFirst",
                        e.target.checked,
                      )
                    }
                  />
                </s-stack>
              </s-grid>
            </CustomSection>
          </CustomGridSection>
          <s-stack padding="base large base none">
            <s-divider />
          </s-stack>
          <CustomGridSection
            heading="App embed status"
            description="Widgets require the app embed to be enabled in your theme."
          >
            <CustomSection>
              <s-grid gap="small">
                <s-grid gridTemplateColumns="20px auto" gap="small">
                  <s-image src={selectedImage} />
                  <s-grid gridTemplateColumns="1fr auto" alignItems="center">
                    <s-box>
                      <s-heading>App embed is enabled</s-heading>
                      <s-paragraph>
                        Widgets can be displayed on your storefront
                      </s-paragraph>
                    </s-box>
                    <s-button icon="app-extension" variant="primary">
                      Manage in theme editor
                    </s-button>
                  </s-grid>
                </s-grid>
                <s-grid
                  gridTemplateColumns="20px 1fr"
                  background="subdued"
                  padding="small"
                  borderRadius="small"
                  gap="small"
                >
                  <s-icon type="info" />
                  <s-paragraph>
                    If the app embed is disabled, none of your widgets will be
                    visible on the storefront.
                  </s-paragraph>
                </s-grid>
              </s-grid>
            </CustomSection>
          </CustomGridSection>
        </CustomSection>
      </s-section>
    </>
  );
}
