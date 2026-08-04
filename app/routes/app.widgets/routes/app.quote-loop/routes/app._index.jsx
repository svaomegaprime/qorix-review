import { useEffect, useRef, useState } from "react";
import Loader from "../../../../../components/essentials/Loader";
import CustomSection from "../../../../../components/essentials/CustomSection";
import Text from "../../../../../components/essentials/elements/Text";
import SaveBar from "../../../components/savebar/SaveBar";
import { useSaveBarTrigger } from "../../../components/savebar/useSaveBarTrigger";
import { requestAppWindowClose } from "../../../utils/useAppWindowClose";
import { useFetcher, useLoaderData, useNavigation } from "react-router";
import Header from "../../../components/Header";
import ColorPicker from "../../../components/elements/ColorPicker";
import QuoteLoopWidget from "../component/quite_loop_preview";
import Range from "../../../components/elements/Range";
import ResetToDefaults from "../../../components/elements/ResetToDefaults";
import AdvanceCSS from "../../../components/elements/AdvanceCSS";
import { authenticate } from "../../../../../shopify.server";
import prisma from "../../../../../db.server";
import { getStoreData } from "../../../../../utils/getStoreData";
import { adminErrorResponse } from "../../../../../utils/adminError.server";
import { useAdminFetcherToast } from "../../../../../utils/useAdminFetcherToast";
import { setAppMetafield } from "../../../../../utils/appMetafields.server";
import {
  COLOR_PICKERS_ELEMENTS,
  DEFAULT_COLOR_VALUES,
  createDefaultSettings,
} from "../data/quoteReviewDefault";
import { getWidgetsInstalledStatus } from "../../../../../services/appEmbed.server";

const cloneSettings = (settings) => JSON.parse(JSON.stringify(settings));

// ---------------------------Effta ata porba then kag korba------------------------------------------------
// DB <-> Frontend mapping helpers
// The DB now stores flat structured columns (no JSON blob for settings).
// The frontend UI still works with a nested `settings` object (with a
// `colors` sub-object), so these two helpers convert between the shapes.
// ---------------------------------------------------------------------------

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
    showQuoteMarkIcon: row.showQuoteMarkIcon,
    showVerifiedBadge: row.showVerifiedBadge,
    showMediaAsset: row.showMediaAsset,
    showArrowControls: row.showArrowControls,
    showProductName: row.showProductName,
    autoSlider: row.autoSlider,
    showAppreciationOption: row.showAppreciationOption,
    speed: row.speed,

    filterSorting: row.filterSorting,
    fiteringMinStart: row.fiteringMinStart,

    colors: {
      STAR_COLOR: row.starColor,
      TEXT_COLOR: row.textColor,
      QUOTE_MARK_COLOR: row.quoteMarkColor,
      Card_Background_Color: row.cardBackgroundColor,
    },

    quoteFontSize: row.quoteFontSize,
    textLength: row.textLength,
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
    showQuoteMarkIcon: settings.showQuoteMarkIcon,
    showVerifiedBadge: settings.showVerifiedBadge,
    showMediaAsset: settings.showMediaAsset,
    showArrowControls: settings.showArrowControls,
    showProductName: settings.showProductName,
    autoSlider: settings.autoSlider,
    showAppreciationOption: settings.showAppreciationOption,
    speed: settings.speed,

    filterSorting: settings.filterSorting,
    fiteringMinStart: settings.fiteringMinStart,

    starColor: settings.colors?.STAR_COLOR ?? DEFAULT_COLOR_VALUES.STAR_COLOR,
    textColor: settings.colors?.TEXT_COLOR ?? DEFAULT_COLOR_VALUES.TEXT_COLOR,
    quoteMarkColor:
      settings.colors?.QUOTE_MARK_COLOR ??
      DEFAULT_COLOR_VALUES.QUOTE_MARK_COLOR,
    cardBackgroundColor:
      settings.colors?.Card_Background_Color ??
      DEFAULT_COLOR_VALUES.Card_Background_Color,

    quoteFontSize: settings.quoteFontSize,
    textLength: settings.textLength,
    advanceCss: settings.advanceCss,
  };
}

export async function loader({ request }) {
  try {
    const { admin } = await authenticate.admin(request);
    const { id } = await getStoreData(admin);

    const res = await prisma.quoteLoopWidget.findUnique({
      where: {
        storeId: id,
      },
    });

    const settings = dbRowToSettings(res);
    const installedWidgetIds = await getWidgetsInstalledStatus(admin);
    settings.isInstalled = installedWidgetIds.includes("quote_loop");

    return settings;
  } catch (error) {
    console.error("[LOADER] ERROR:", error);
    return adminErrorResponse(error);
  }
}

export async function action({ request }) {
  try {
    const { admin } = await authenticate.admin(request);

    const data = await request.json();
    const { id } = await getStoreData(admin);

    const dbFields = settingsToDbFields(data);

    const res = await prisma.quoteLoopWidget.upsert({
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

    const metaObjectdata = await setAppMetafield(admin, "quote_loop", res);

    return {
      ok: true,
      widget: res,
    };
  } catch (error) {
    console.error("[ACTION] ERROR:", error);
    return adminErrorResponse(error);
  }
}

export default function Index(VALUES = {}) {
  // Start----Default CSR loading state checking for navigation
  const navigation = useNavigation();
  const loading = navigation.state === "loading";
  // End----Default CSR loading state checking for navigation

  const loaderData = useLoaderData();

  const [activeDevice, setActiveDevice] = useState("desktop");

  const [settings, setSettings] = useState(() =>
    cloneSettings(loaderData || createDefaultSettings()),
  );
  const [customCss, setCss] = useState(
    () => loaderData?.advanceCss ?? createDefaultSettings().advanceCss ?? "",
  );

  const handleSettingChange = (key, value) => {
    if (typeof key !== "string") {
      console.warn("Invalid settings key:", key);
      return;
    }
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleChangeColors = (e) => {
    handleSettingChange("colors", {
      ...(settings?.colors || DEFAULT_COLOR_VALUES),
      ...e,
    });
  };

  const handleResetToDefaults = () => {
    const defaults = createDefaultSettings();
    setSettings(defaults);
    setCss(defaults.advanceCss || "");
  };

  const handleCssChange = (value) => {
    setCss(value);
    handleSettingChange("advanceCss", value);
  };

  const postData = () => ({
    ...settings,
  });

  const fetcher = useFetcher();
  useAdminFetcherToast(fetcher);
  const initSettingsRef = useRef(null);
  const savePendingRef = useRef(false);

  if (initSettingsRef.current === null) {
    initSettingsRef.current = cloneSettings(settings);
  }

  const handleSubmit = () => {
    savePendingRef.current = true;
    fetcher.submit(postData(), {
      method: "post",
      encType: "application/json",
    });
  };

  // Start----Handlers for hide app window
  const handleHideAppWindow = () => {
    requestAppWindowClose("quote_loop");
  };
  // End----Handlers for hide app window

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
  // End----Handlers for SaveBar

  // Start----Hide app window padding and remove app nav
  useEffect(() => {
    if (
      !savePendingRef.current ||
      fetcher.state !== "idle" ||
      fetcher.data === undefined ||
      fetcher.data?.ok === false
    ) {
      return;
    }

    initSettingsRef.current = cloneSettings(settings);
    savePendingRef.current = false;
  }, [fetcher.data, fetcher.state, settings]);

  useEffect(() => {
    const hasChanged =
      JSON.stringify(settings) !== JSON.stringify(initSettingsRef.current);

    if (hasChanged) {
      saveBar.triggerChange();
    } else {
      saveBar.triggerDiscard({ silent: true });
    }
  }, [settings, saveBar.triggerChange, saveBar.triggerDiscard]);

  useEffect(() => {
    const body = document.querySelector("body");
    if (body) body.style.margin = "0";
    const appNav = document.querySelector("s-app-nav");
    if (appNav) appNav.remove();
  }, []);
  // End----Hide app window padding and remove app nav

  if (loading) {
    return <Loader />; // Show loader while navigating to this page or when loader is fetching data
  }

  return (
    <>
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
                  <Text as="h3">QuoteLoop</Text>
                  {loaderData?.isInstalled ? (
                    <s-badge tone="success">Installed</s-badge>
                  ) : (
                    <s-badge tone="caution">Not installed</s-badge>
                  )}
                </s-stack>
                <s-paragraph color="subdued">
                  Show quotes on your storefront
                </s-paragraph>
              </s-box>
            </s-grid>
            <s-divider />
            <div
              style={{
                height: "calc(100vh - 77px)",
                overflow: "hidden auto",
                background: "#fff",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {/* Start----Sidebar content */}

              {/* ----------Display Elements start ------------ */}
              <div style={{ padding: "1rem" }} className="sidebar-content">
                <Header
                  handleSettingChange={handleSettingChange}
                  settings={settings}
                />
                <br></br>
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
                      label="Show star rating"
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
                      id="show-quote-mark-icon"
                      label="Show quote mark icon"
                      checked={settings.showQuoteMarkIcon}
                      onChange={(e) =>
                        handleSettingChange(
                          "showQuoteMarkIcon",
                          e.target.checked,
                        )
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
                      label="Show auth image"
                      checked={settings.showMediaAsset}
                      onChange={(e) =>
                        handleSettingChange("showMediaAsset", e.target.checked)
                      }
                    ></s-switch>
                  </s-stack>

                  <s-stack>
                    <s-switch
                      id="show-share-option"
                      label="Show product Name"
                      checked={settings.showProductName}
                      onChange={(e) =>
                        handleSettingChange("showProductName", e.target.checked)
                      }
                    ></s-switch>
                  </s-stack>
                </s-stack>
              </div>
              {/* ----------Display Elements end ------------ */}

              {/* ----------Layout option start ------------ */}
              <div style={{ padding: "1rem" }}>
                <s-stack
                  border="base"
                  borderRadius="base"
                  padding="large"
                  gap="small"
                >
                  <s-heading level="1">Loop behavior</s-heading>
                  <s-stack>
                    <s-switch
                      id="show-arrow-controls"
                      label="Show arrow controls"
                      checked={settings.showArrowControls}
                      onChange={(e) =>
                        handleSettingChange(
                          "showArrowControls",
                          e.target.checked,
                        )
                      }
                    ></s-switch>
                  </s-stack>

                  <s-stack>
                    <s-switch
                      id="auto-rotate"
                      label="Auto-rotate"
                      checked={settings.autoSlider}
                      onChange={(e) =>
                        handleSettingChange("autoSlider", e.target.checked)
                      }
                    ></s-switch>
                  </s-stack>

                  <s-stack
                    padding="small"
                    border="base"
                    borderRadius="large"
                    gap="small"
                  >
                    <s-heading level="3">Autoplay speed</s-heading>
                    <Range
                      onChange={(e) =>
                        handleSettingChange("speed", Number(e.target.value))
                      }
                      unit="ms"
                      defaultValue={settings?.speed}
                      min={400}
                      max={600}
                    />
                  </s-stack>

                  <s-stack
                    border="base"
                    paddingInlineStart="small"
                    borderRadius="base"
                    padding="small"
                  >
                    <s-select
                      label="Filter min stars"
                      value={settings.fiteringMinStart}
                      onChange={(e) =>
                        handleSettingChange("fiteringMinStart", e.target.value)
                      }
                    >
                      <s-option value="ALL">
                        Show all ratings
                      </s-option>
                      <s-option value="STAR_3">
                        3 star and above
                      </s-option>
                      <s-option value="STAR_4">
                        4 star and above
                      </s-option>
                      <s-option value="STAR_5">5 star only</s-option>
                    </s-select>
                  </s-stack>
                </s-stack>
              </div>
              {/* ----------Layout option end ------------ */}

              <div style={{ padding: "1rem" }}>
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
                      defaultColor={
                        VALUES[picker.key] ?? settings?.colors[picker.key]
                      }
                      onChange={(value) =>
                        handleChangeColors({ [picker.key]: value })
                      }
                    />
                  ))}
                </s-stack>
              </div>

              {/* Typography & layout */}

              <div style={{ padding: "1rem" }}>
                <s-stack
                  border="base"
                  borderRadius="base"
                  padding="large"
                  gap="small"
                >
                  <s-heading level="1">Typography & layout</s-heading>

                  <s-stack
                    padding="small"
                    border="base"
                    borderRadius="large"
                    gap="small"
                  >
                    <s-heading level="3">Quote font size</s-heading>
                    <Range
                      onChange={(e) =>
                        handleSettingChange(
                          "quoteFontSize",
                          Number(e.target.value),
                        )
                      }
                      unit="px"
                      defaultValue={settings?.quoteFontSize}
                      min={20}
                      max={40}
                    />
                  </s-stack>

                  <s-stack
                    padding="small"
                    border="base"
                    borderRadius="large"
                    gap="small"
                  >
                    <s-heading level="3">Max text length</s-heading>
                    <Range
                      onChange={(e) =>
                        handleSettingChange(
                          "textLength",
                          Number(e.target.value),
                        )
                      }
                      unit="ch"
                      defaultValue={settings?.textLength}
                      max={160}
                    />
                  </s-stack>
                </s-stack>

                <s-stack>
                  <AdvanceCSS css={customCss} setCss={handleCssChange} />
                </s-stack>

                <s-stack>
                  <ResetToDefaults
                    handleResetToDefaults={handleResetToDefaults}
                  />
                </s-stack>
              </div>
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
                  gridTemplateColumns="@container (inline-size > 600px)  1fr auto, 1fr "
                  gap="small"
                  justifyContent="space-between"
                  paddingInline="base"
                >
                  <s-stack
                    alignItems="center"
                    justifyContent="center"
                    gap="small"
                  >
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
                  <s-button-group gap="base">
                    <s-button slot="secondary-actions">Need help?</s-button>
                    <s-button variant="primary" slot="primary-action">
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
                </s-grid>
              </s-query-container>
            </div>
            {/* End----Preview Header */}
            <QuoteLoopWidget settings={settings} activeDevice={activeDevice} />
            {/* Start----Preview Content */}
            {/* End----Preview Content */}
          </div>
          {/* End----Content */}
        </s-grid>
      </s-query-container>
    </>
  );
}
