import { useEffect, useRef, useState } from "react";
import Loader from "../../../../../components/essentials/Loader";
import CustomSection from "../../../../../components/essentials/CustomSection";
import Text from "../../../../../components/essentials/elements/Text";
import SaveBar from "../../../components/savebar/SaveBar";
import { useSaveBarTrigger } from "../../../components/savebar/useSaveBarTrigger";
import { requestAppWindowClose } from "../../../utils/useAppWindowClose";
import { useFetcher, useLoaderData, useNavigation } from "react-router";
import Header from "../../../components/header";
import ColorPicker from "../../../components/elements/ColorPicker";
import ReviewHumComponent from "../Component/Reviewhup_widgth_preview";
import ResetToDefaults from "../../../components/elements/ResetToDefaults";
import AdvanceCSS from "../../../components/elements/AdvanceCSS";
import {
  COLOR_PICKERS_ELEMENTS,
  DEFAULT_COLOR_VALUES,
  DEFAULT_REVIEW_HUB_DATA,
} from "../data/defaultData";
import { getWidgetsInstalledStatus } from "../../../../../services/appEmbed.server";
import { authenticate } from "../../../../../shopify.server";
import prisma from "../../../../../db.server";
import { getStoreData } from "../../../../../utils/getStoreData";
import { setAppMetafield } from "../../../../../utils/appMetafields.server";
import { adminErrorResponse } from "../../../../../utils/adminError.server";
import { useAdminFetcherToast } from "../../../../../utils/useAdminFetcherToast";
const createDefaultSettings = () => ({
  ...DEFAULT_REVIEW_HUB_DATA,
  colors: { ...DEFAULT_COLOR_VALUES },
});

const cloneSettings = (settings) => JSON.parse(JSON.stringify(settings));

function dbRowToSettings(row) {
  if (!row) return createDefaultSettings();

  return {
    showHeader: row.showHeader,
    headerStyle: row.headerStyle,
    eyebrowLabel: row.eyebrowLabel,
    heading: row.heading,
    subheading: row.subheading,
    reviewStats: row.reviewStats,

    showStarDistribution: row.showStarDistribution,
    showReviewerName: row.showReviewerName,
    showReviewTimer: row.showReviewTimer,
    showVerifiedBadge: row.showVerifiedBadge,
    showMediaAsset: row.showMediaAsset,
    showShareOption: row.showShareOption,
    showAppreciationOption: row.showAppreciationOption,

    layout: row.layout,
    filterSorting: row.filterSorting,
    filterMinStar: row.filterMinStar,
    reviewsPerPage: row.reviewsPerPage,

    colors: {
      STAR_COLOR: row.starColor,
      TEXT_COLOR: row.textColor,
      VERIFIED_BADGE_COLOR: row.verifiedBadgeColor,
      Card_Background_Color: row.cardBackgroundColor,
      Border_Color: row.borderColor,
      FILTER_CHIP_COLOR: row.filterChipColor,
      FILTER_CHIP_COLOR_STAR_COLOR: row.filterChipStarColor,
    },

    advanceCss: row.advanceCss,
  };
}

function settingsToDbFields(settings) {
  return {
    showHeader: settings.showHeader,
    headerStyle: settings.headerStyle,
    eyebrowLabel: settings.eyebrowLabel,
    heading: settings.heading,
    subheading: settings.subheading,
    reviewStats: settings.reviewStats,

    showStarDistribution: settings.showStarDistribution,
    showReviewerName: settings.showReviewerName,
    showReviewTimer: settings.showReviewTimer,
    showVerifiedBadge: settings.showVerifiedBadge,
    showMediaAsset: settings.showMediaAsset,
    showShareOption: settings.showShareOption,
    showAppreciationOption: settings.showAppreciationOption,

    layout: settings.layout,
    filterSorting: settings.filterSorting,
    filterMinStar: settings.filterMinStar,
    reviewsPerPage: settings.reviewsPerPage,

    starColor: settings.colors?.STAR_COLOR ?? DEFAULT_COLOR_VALUES.STAR_COLOR,
    textColor: settings.colors?.TEXT_COLOR ?? DEFAULT_COLOR_VALUES.TEXT_COLOR,
    verifiedBadgeColor:
      settings.colors?.VERIFIED_BADGE_COLOR ??
      DEFAULT_COLOR_VALUES.VERIFIED_BADGE_COLOR,
    cardBackgroundColor:
      settings.colors?.Card_Background_Color ??
      DEFAULT_COLOR_VALUES.Card_Background_Color,
    borderColor:
      settings.colors?.Border_Color ?? DEFAULT_COLOR_VALUES.Border_Color,
    filterChipColor:
      settings.colors?.FILTER_CHIP_COLOR ??
      DEFAULT_COLOR_VALUES.FILTER_CHIP_COLOR,
    filterChipStarColor:
      settings.colors?.FILTER_CHIP_COLOR_STAR_COLOR ??
      DEFAULT_COLOR_VALUES.FILTER_CHIP_COLOR_STAR_COLOR,

    advanceCss: settings.advanceCss,
  };
}

export async function loader({ request }) {
  try {
    const { admin, session } = await authenticate.admin(request);
    const { id } = await getStoreData(admin);

    const res = await prisma.reviewHubWidget.findUnique({
      where: {
        storeId: id,
      },
    });

    const settings = dbRowToSettings(res);
    const installedWidgetIds = await getWidgetsInstalledStatus(admin);
    settings.isInstalled = installedWidgetIds.includes("review_hub");
    settings.shop = session?.shop;

    return settings;
  } catch (error) {
    return adminErrorResponse(error);
  }
}
export async function action({ request }) {
  try {
    const { admin } = await authenticate.admin(request);

    const data = await request.json();
    const { id } = await getStoreData(admin);
    const dbFields = settingsToDbFields(data);

    const res = await prisma.reviewHubWidget.upsert({
      where: {
        storeId: id,
      },
      update: dbFields,
      create: {
        ...dbFields,
        store: {
          connect: {
            storeGID: id,
          },
        },
      },
    });

    const metafieldResult = await setAppMetafield(admin, "review_hub", res);
    const metafieldErrors =
      metafieldResult?.data?.metafieldsSet?.userErrors ?? [];

    if (metafieldErrors.length > 0) {
      throw new Error(metafieldErrors.map(({ message }) => message).join(", "));
    }

    return {
      ok: true,
      widget: dbRowToSettings(res),
      metafieldResult,
    };
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export default function Index() {
  // Start----Default CSR loading state checking for navigation
  const navigation = useNavigation();
  const loaderData = useLoaderData();
  const fetcher = useFetcher();
  useAdminFetcherToast(fetcher);
  const loading = navigation.state === "loading";
  // End----Default CSR loading state checking for navigation

  const [activeDevice, setActiveDevice] = useState("desktop");

  const [settings, setSettings] = useState(() =>
    cloneSettings(loaderData || createDefaultSettings()),
  );
  const [coustomCss, setCss] = useState(
    () => loaderData?.advanceCss ?? DEFAULT_REVIEW_HUB_DATA.advanceCss,
  );

  const handleSettingChange = (key, value) => {
    if (typeof key !== "string") {
      console.warn("Invalid settings key:", key);
      return;
    }
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  console.log("Settings:", settings);

  const handleResetToDefaults = () => {
    const defaults = createDefaultSettings();
    setSettings(defaults);
    setCss(defaults.advanceCss || "");
  };

  const handleCssChange = (value) => {
    setCss(value);
    handleSettingChange("advanceCss", value);
  };

  // Start----Handlers for hide app window
  const handleHideAppWindow = () => {
    requestAppWindowClose("review_hub");
  };
  // End----Handlers for hide app window
  const postData = () => ({
    ...settings,
    advanceCss: coustomCss,
  });

  const initSettingsRef = useRef(null);
  const savePendingRef = useRef(false);

  const handleSubmit = () => {
    const submittedSettings = postData();

    savePendingRef.current = true;
    fetcher.submit(submittedSettings, {
      method: "post",
      encType: "application/json",
    });
  };

  // Start----Handlers for SaveBar
  const saveBar = useSaveBarTrigger({
    onSubmit: () => {
      handleSubmit();
    },
    onDiscard: () => {
      setSettings(cloneSettings(initSettingsRef.current));
      setCss(initSettingsRef.current?.advanceCss || "");
    },
  });
  const { triggerChange, triggerDiscard } = saveBar;
  // End----Handlers for SaveBar

  // Start----Detect settings changes → show/hide SaveBar
  if (initSettingsRef.current === null) {
    initSettingsRef.current = cloneSettings(settings);
  }

  useEffect(() => {
    if (
      !savePendingRef.current ||
      fetcher.state !== "idle" ||
      fetcher.data?.ok !== true
    ) {
      return;
    }

    initSettingsRef.current = cloneSettings(fetcher.data.widget);
    savePendingRef.current = false;
  }, [fetcher.data, fetcher.state]);

  useEffect(() => {
    const hasChanged =
      JSON.stringify(settings) !== JSON.stringify(initSettingsRef.current);

    if (hasChanged) {
      triggerChange();
    } else {
      triggerDiscard({ silent: true });
    }
  }, [settings, triggerChange, triggerDiscard]);
  // End----Detect settings changes → show/hide SaveBar

  // Start----Hide app window padding and remove app nav
  useEffect(() => {
    const body = document.querySelector("body");
    if (body) body.style.margin = "0";
    const appNav = document.querySelector("s-app-nav");
    if (appNav) appNav.remove();
  }, []);
  // End----Hide app window padding and remove app nav

  const handleChangeColors = (e) => {
    handleSettingChange("colors", {
      ...(settings?.colors || DEFAULT_COLOR_VALUES),
      ...e,
    });
  };

  if (loading) {
    return <Loader />; // Show loader while navigating to this page or when loader is fetching data
  }

  return (
    <>
      {/* Start----Hide app window padding and remove app nav */}
      <style>
        {`
          *::-webkit-scrollbar, html::-webkit-scrollbar, body::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
          *, html, body {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }

          .review-item {
            height: 76px;
            display: grid;
            align-items: center;
            border-bottom: 1px solid #e4e4e4;
          }

          .sidebar-content {
            height: calc(100vh - 77px);
            overflow: hidden auto;
            background: #fff;
            padding: 1rem;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          @media (max-width: 900px) {
            .sidebar-content {
              height: auto;
              overflow: visible;
              padding: 0.75rem;
            }

            .review-item {
              height: 248px;
            }
          }
        `}
      </style>
      {/* End----Hide app window padding and remove app nav */}

      <SaveBar saveBar={saveBar} />
      <s-query-container>
        <s-grid
          gridTemplateColumns="@container (inline-size > 900px) 346px 1fr, 1fr"
          alignItems="start"
        >
          {/* Start----Sidebar */}
          <CustomSection
            borderRadius="0"
            boxShadow="none"
            borderLeft="none"
            borderTop="none"
            borderBottom="none"
            padding="none"
            background="#fff"
          >
            <s-grid
              gridTemplateColumns="auto 1fr"
              gap="small"
              padding="small base"
            >
              <s-button variant="tertiary" onClick={handleHideAppWindow}>
                <s-icon type="arrow-left" />
              </s-button>
              <s-box>
                <s-stack direction="inline" alignItems="center" gap="small">
                  <Text as="h3">ReviewHub</Text>
                  {loaderData?.isInstalled ? (
                    <s-badge tone="success">Installed</s-badge>
                  ) : (
                    <s-badge tone="caution">Not installed</s-badge>
                  )}
                </s-stack>
                <s-paragraph color="subdued">
                  Shows average rating + review count.
                </s-paragraph>
              </s-box>
            </s-grid>
            <s-divider />
            <div className="sidebar-content" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {/* Start----Sidebar content */}
              <Header
                handleSettingChange={handleSettingChange}
                settings={settings}
              />

              {/* ----------Display Elements start ------------ */}
              <div style={{ marginTop: "2rem" }}>
                <s-stack
                  border="base"
                  borderRadius="base"
                  padding="large"
                  gap="small"
                >
                  <s-heading level="1">Display elements</s-heading>

                  <s-stack paddingBlockStart="small">
                    <s-switch
                      id="show-star-distribution"
                      label="Show star distribution bars"
                      checked={settings.showStarDistribution}
                      onChange={(e) =>
                        handleSettingChange(
                          "showStarDistribution",
                          e.target.checked,
                        )
                      }
                    ></s-switch>
                  </s-stack>

                  <s-stack>
                    <s-switch
                      id="show-reviewer-name"
                      label="Show reviewer name"
                      checked={settings.showReviewerName}
                      onChange={(e) =>
                        handleSettingChange(
                          "showReviewerName",
                          e.target.checked,
                        )
                      }
                    ></s-switch>
                  </s-stack>

                  <s-stack>
                    <s-switch
                      id="show-review-timer"
                      label="Show review timer"
                      checked={settings.showReviewTimer}
                      onChange={(e) =>
                        handleSettingChange("showReviewTimer", e.target.checked)
                      }
                    ></s-switch>
                  </s-stack>

                  <s-stack>
                    <s-switch
                      id="show-verified-badge"
                      label="Show verified badge"
                      checked={settings.showVerifiedBadge}
                      onChange={(e) =>
                        handleSettingChange(
                          "showVerifiedBadge",
                          e.target.checked,
                        )
                      }
                    ></s-switch>
                  </s-stack>

                  <s-stack>
                    <s-switch
                      id="show-media-asset"
                      label="Show media asset(if available)"
                      checked={settings.showMediaAsset}
                      onChange={(e) =>
                        handleSettingChange("showMediaAsset", e.target.checked)
                      }
                    ></s-switch>
                  </s-stack>

                  <s-stack>
                    <s-switch
                      id="show-share-option"
                      label="Show share option"
                      checked={settings.showShareOption}
                      onChange={(e) =>
                        handleSettingChange("showShareOption", e.target.checked)
                      }
                    ></s-switch>
                  </s-stack>

                  <s-stack>
                    <s-switch
                      id="show-appreciation-option"
                      label="Show appreciation option"
                      checked={settings.showAppreciationOption}
                      onChange={(e) =>
                        handleSettingChange(
                          "showAppreciationOption",
                          e.target.checked,
                        )
                      }
                    ></s-switch>
                  </s-stack>
                </s-stack>
              </div>
              {/* ----------Display Elements end ------------ */}

              {/* ----------Layout option start ------------ */}
              <div style={{ marginTop: "2rem" }}>
                <s-stack
                  border="base"
                  borderRadius="base"
                  padding="large"
                  gap="small"
                >
                  <s-heading level="1">Layout option</s-heading>

                  <s-stack
                    border="base"
                    paddingInlineStart="small"
                    borderRadius="base"
                    padding="small"
                  >
                    <s-select
                      label="Layout"
                      value={settings.layout}
                      onChange={(e) =>
                        handleSettingChange("layout", e.target.value)
                      }
                    >
                      <s-option value="2">2 column grid</s-option>
                      <s-option value="3">3 column grid</s-option>
                      <s-option value="4">4 column grid</s-option>
                    </s-select>
                  </s-stack>

                  <s-stack
                    border="base"
                    paddingInlineStart="small"
                    borderRadius="base"
                    padding="small"
                  >
                    <s-select
                      label="Filter & sorting"
                      value={settings.filterSorting}
                      onChange={(e) =>
                        handleSettingChange("filterSorting", e.target.value)
                      }
                    >
                      <s-option value="FILTER_AND_SORTING">
                        Filter & sorting both
                      </s-option>
                      <s-option value="FILTER_ONLY">Filter only</s-option>
                      <s-option value="SORTING_ONLY">Sorting only</s-option>
                      <s-option value="NONE">None</s-option>
                    </s-select>
                  </s-stack>

                  <s-stack
                    border="base"
                    paddingInlineStart="small"
                    borderRadius="base"
                    padding="small"
                  >
                    <s-select
                      label="Reviews per page"
                      value={settings.reviewsPerPage}
                      onChange={(e) =>
                        handleSettingChange(
                          "reviewsPerPage",
                          Number(e.target.value),
                        )
                      }
                    >
                      <s-option value="6">6 reviews</s-option>
                      <s-option value="9">9 reviews</s-option>
                      <s-option value="12">12 reviews</s-option>
                      <s-option value="15">15 reviews</s-option>
                      <s-option value="18">18 reviews</s-option>
                      <s-option value="24">24 reviews</s-option>
                    </s-select>
                  </s-stack>

                  <s-stack
                    border="base"
                    paddingInlineStart="small"
                    borderRadius="base"
                    padding="small"
                  >
                    <s-select
                      label="Filter min stars"
                      value={settings.filterMinStar}
                      details="This option isn't shown in the preview. It will take effect on your live review widget once customers submit reviews."
                      onChange={(e) =>
                        handleSettingChange("filterMinStar", e.target.value)
                      }
                    >
                      <s-option value="ALL">Show all ratings</s-option>
                      <s-option value="STAR_3">3 star and above</s-option>
                      <s-option value="STAR_4">4 star and above</s-option>
                      <s-option value="STAR_5">5 star only</s-option>
                    </s-select>
                  </s-stack>
                </s-stack>
              </div>
              {/* ----------Layout option end ------------ */}
              {/* ----------Layout option end ------------ */}

              <div style={{ marginTop: "2rem" }}>
                <s-stack
                  border="base"
                  borderRadius="base"
                  padding="large"
                  gap="small"
                >
                  <s-heading level="1">Color</s-heading>

                  {COLOR_PICKERS_ELEMENTS.map((picker) => (
                    <ColorPicker
                      key={picker.key}
                      data={picker}
                      defaultColor={settings?.colors?.[picker.key]}
                      onChange={(value) =>
                        handleChangeColors({ [picker.key]: value })
                      }
                    />
                  ))}
                </s-stack>
              </div>

              <s-stack>
                <AdvanceCSS setCss={handleCssChange} css={coustomCss} />
              </s-stack>

              <s-stack gap="large" paddingBlockEnd="large">
                <ResetToDefaults
                  handleResetToDefaults={handleResetToDefaults}
                />
              </s-stack>
              {/* End----Sidebar content */}
            </div>
          </CustomSection>

          {/* End----Sidebar */}

          {/* Start----Content */}
          <div
            style={{
              height: "100vh",
              overflow: "hidden",
              background: "#fff",
            }}
          >
            {/* Start----Preview Header */}
            <div className="review-item">
              <s-query-container>
                <s-grid
                  gridTemplateColumns="@container (inline-size > 900px) 1fr auto, 1fr"
                  gap="small"
                  justifyContent="space-between"
                  paddingInline="base"
                >
                  <s-stack alignItems="center">
                    <s-button-group gap="none">
                      <s-button
                        slot="secondary-actions"
                        icon="desktop"
                        onClick={() => setActiveDevice("desktop")}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: "0",
                            left: "0",
                            width: "100%",
                            height: "100%",
                            background:
                              activeDevice === "desktop"
                                ? "#0000000f"
                                : "transparent",
                            borderRadius: "8px 0 0 8px",
                          }}
                        ></div>
                        Desktop preview
                      </s-button>
                      <s-button
                        slot="secondary-actions"
                        icon="mobile"
                        onClick={() => setActiveDevice("mobile")}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: "0",
                            left: "0",
                            width: "100%",
                            height: "100%",
                            background:
                              activeDevice === "mobile"
                                ? "#0000000f"
                                : "transparent",
                            borderRadius: "0 8px 8px 0",
                          }}
                        ></div>
                        Mobile preview
                      </s-button>
                    </s-button-group>
                  </s-stack>

                  <s-stack alignItems="center">
                    <s-button-group gap="base">
                      <s-button slot="secondary-actions">Need help?</s-button>
                      <s-button
                        variant="primary"
                        slot="primary-action"
                        onClick={() => {
                          if (loaderData?.shop) {
                            window.open(`https://${loaderData.shop}`, "_blank");
                          }
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          Preview on store <s-icon type="arrow-up-right" />
                        </div>
                      </s-button>
                    </s-button-group>
                  </s-stack>
                </s-grid>
              </s-query-container>
            </div>
            {/* End----Preview Header */}

            <ReviewHumComponent
              activeDevice={activeDevice}
              settings={settings}
            />

            {/* Start----Preview Content */}
            {/* End----Preview Content */}
          </div>
          {/* End----Content */}
        </s-grid>
      </s-query-container>
    </>
  );
}
