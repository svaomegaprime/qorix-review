import { useEffect, useRef, useState } from "react";
import { useNavigation, useLoaderData, useFetcher } from "react-router";

import Loader from "../../../../../components/essentials/Loader";
import CustomSection from "../../../../../components/essentials/CustomSection";
import Text from "../../../../../components/essentials/elements/Text";
import SaveBar from "../../../components/savebar/SaveBar";
import { useSaveBarTrigger } from "../../../components/savebar/useSaveBarTrigger";
import { requestAppWindowClose } from "../../../utils/useAppWindowClose";
import { useAdminFetcherToast } from "../../../../../utils/useAdminFetcherToast";
import ColorPicker from "../../../components/elements/ColorPicker";
import Header from "../../../components/header";
import ResetToDefaults from "../../../components/elements/ResetToDefaults";
import Range from "../../../components/elements/Range";
import ReviewReelPreeview from "../component/reviewReelPreview";
import AdvancedCSS from "../../../components/elements/AdvanceCSS";

// ---- server-only imports, only used inside loader/action ----
import prisma from "../../../../../db.server";
import { authenticate } from "../../../../../shopify.server";
import { adminErrorResponse } from "../../../../../utils/adminError.server";
import { setAppMetafield } from "../../../../../utils/appMetafields.server";
import { getStoreData } from "../../../../../utils/getStoreData";

// Default data + color picker list ekhon alada file theke ashe (video-stack er moto pattern)
import {
  COLOR_PICKERS_ELEMENTS,
  DEFAULT_VALUES_REVIEW_REEL,
} from "../component/data/reviewRealDefaultData";
import { getWidgetsInstalledStatus } from "../../../../../services/appEmbed.server";

// Shudhu eituku list-e thaka key gulai DB column, eta ekbar likhe rakle
// mapper function 2ta ekhane sync thakbe.
const SETTINGS_KEYS = Object.keys(DEFAULT_VALUES_REVIEW_REEL);

function cloneSettings(settings) {
  return JSON.parse(JSON.stringify(settings));
}

// DB row -> front-end settings object. row na thakle default dibe.
function dbRowToSettings(row) {
  if (!row) {
    return { ...DEFAULT_VALUES_REVIEW_REEL };
  }
  const settings = {};
  for (const key of SETTINGS_KEYS) {
    settings[key] =
      row[key] !== undefined && row[key] !== null
        ? row[key]
        : DEFAULT_VALUES_REVIEW_REEL[key];
  }
  return settings;
}

// front-end settings object -> DB fields (create/update er jonno)
function settingsToDbFields(settings = {}) {
  const dbFields = {};
  for (const key of SETTINGS_KEYS) {
    if (settings[key] === undefined) continue;
    dbFields[key] = settings[key];
  }

  // <s-select> theke number field gulo string hisebe ashe, DB column Int
  if (dbFields.autoplaySpeed !== undefined) {
    dbFields.autoplaySpeed = Number(dbFields.autoplaySpeed);
  }
  if (dbFields.cardsVisible !== undefined) {
    dbFields.cardsVisible = Number(dbFields.cardsVisible);
  }

  // advanceCss kokhono null jate DB te na jay
  if (dbFields.advanceCss === undefined || dbFields.advanceCss === null) {
    dbFields.advanceCss = "";
  }

  return dbFields;
}

// ------------------------------------------------------------------
// LOADER — page load-e DB theke settings anbe, na thakle default dibe
// ------------------------------------------------------------------
export async function loader({ request }) {
  try {
    const { admin, session } = await authenticate.admin(request);
    const { id: shop } = await getStoreData(admin);

    const row = await prisma.reviewReelSettings.findUnique({
      where: { storeId: shop },
    });

    const settings = dbRowToSettings(row);
    const installedWidgetIds = await getWidgetsInstalledStatus(admin);
    settings.isInstalled = installedWidgetIds.includes("review_reel");
    settings.shop = session?.shop;

    return settings;
  } catch (error) {
    console.error("[LOADER] ERROR:", error);
    return adminErrorResponse(error);
  }
}

// ------------------------------------------------------------------
// ACTION — Save chapleay POST hoye asba, DB te upsert + metafield update
// ------------------------------------------------------------------
export async function action({ request }) {
  try {
    const { admin } = await authenticate.admin(request);
    const { id: shop } = await getStoreData(admin);
    const data = await request.json();

    const dbFields = settingsToDbFields(data);

    // shop ekhane unique key — thakle update, na thakle notun row create hobe
    const res = await prisma.reviewReelSettings.upsert({
      where: { storeId: shop },
      update: dbFields,
      create: {
        store: {
          connect: {
            storeGID: shop,
          },
        },
        ...dbFields,
      },
    });

    // DB theke ja shave holo, oi data diye storefront metafield update kora hocche

    await setAppMetafield(admin, "review_reel", res);

    return {
      ok: true,
      widget: res,
    };
  } catch (error) {
    console.error("[ACTION] ERROR:", error);
    return adminErrorResponse(error);
  }
}

export default function Index() {
  // Start----Default CSR loading state checking for navigation
  const navigation = useNavigation();
  const loading = navigation.state === "loading";
  // End----Default CSR loading state checking for navigation

  // loader theke asha data — na thakle default fallback
  const loaderData = useLoaderData() || {};
  const fetcher = useFetcher();
  useAdminFetcherToast(fetcher);

  const [resetKey, setResetKey] = useState(0);
  const [activeDevice, setActiveDevice] = useState("desktop");
  const [settings, setSettings] = useState({
    ...DEFAULT_VALUES_REVIEW_REEL,
    ...loaderData,
  });
  const [customCss, setCss] = useState(
    (loaderData && loaderData.advanceCss) ||
    DEFAULT_VALUES_REVIEW_REEL.advanceCss ||
    "",
  );

  // Save Discard button-er jonno "shuru te ja chilo" ta ei ref e rakha thake
  const initSettingsRef = useRef(null);
  const savePendingRef = useRef(false);

  const colorValues = {
    BADGE_COLOR: settings.startColor,
    ACTIVE_DOT_COLOR: settings.activeDotColor,
    CARD_BACKGROUND: settings.cardBackgorud,
    CARD_TEXT_COLOR: settings.cardTextColor,
  };

  const COLOR_KEY_MAP = {
    BADGE_COLOR: "startColor", // BADGE_COLOR → startColor
    ACTIVE_DOT_COLOR: "activeDotColor", // ACTIVE_DOT_COLOR → activeDotColor
    CARD_BACKGROUND: "cardBackgorud", // CARD_BACKGROUND → cardBackgorud
    CARD_TEXT_COLOR: "cardTextColor", // CARD_TEXT_COLOR → cardTextColor
  };

  const handleChangeColorPiker = (newColor) => {
    const [key, value] = Object.entries(newColor)[0];
    setSettings((prev) => ({
      ...prev,
      [COLOR_KEY_MAP[key]]: value,
    }));
  };

  const handleResetToDefaults = () => {
    const defaults = { ...DEFAULT_VALUES_REVIEW_REEL };
    setSettings(defaults);
    setCss(defaults.advanceCss || "");
    setResetKey((prev) => prev + 1);
  };

  const handleSettingChange = (key, value) => {
    if (typeof key !== "string") {
      console.warn("Invalid settings key:", key);
      return;
    }
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleCssChange = (value) => {
    setCss(value);
    handleSettingChange("advanceCss", value);
  };

  // Start----Handlers for hide app window
  const handleHideAppWindow = () => {
    requestAppWindowClose("review_reel");
  };
  // End----Handlers for hide app window

  // Start----Handlers for SaveBar
  if (initSettingsRef.current === null) {
    initSettingsRef.current = cloneSettings({
      ...DEFAULT_VALUES_REVIEW_REEL,
      ...loaderData,
    });
  }

  const saveBar = useSaveBarTrigger({
    onSubmit: () => {
      savePendingRef.current = true;
      fetcher.submit(settings, {
        method: "post",
        encType: "application/json",
      });
    },
    onDiscard: () => {
      setSettings(cloneSettings(initSettingsRef.current));
      setCss(initSettingsRef.current?.advanceCss || "");
    },
  });
  // End----Handlers for SaveBar

  // fetcher save shesh hoye "ok" ashle, current settings-i notun baseline hisebe set hoy
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

  // Start----Hide app window padding and remove app nav
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
                  <Text as="h3">ReviewReel</Text>
                  {loaderData?.isInstalled ? (
                    <s-badge tone="success">Installed</s-badge>
                  ) : (
                    <s-badge tone="caution">Not installed</s-badge>
                  )}
                </s-stack>
                <s-paragraph color="subdued">
                  Show your reviews in a slider with videos and images
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
              <div style={{ padding: "1rem" }}>
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
                      id="Show reviewer image"
                      label="Show reviewer image"
                      checked={settings.showReviewImage}
                      onChange={(e) =>
                        handleSettingChange(
                          "showReviewImage",
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
                      id="show-share-option"
                      label="Show product Name"
                      checked={settings.showProductName}
                      onChange={(e) =>
                        handleSettingChange(
                          "showProductName",
                          e.target.checked,
                        )
                      }
                    ></s-switch>
                  </s-stack>

                  <s-stack>
                    <s-switch
                      id="Show-review-date"
                      label="Show review date"
                      checked={settings.showReviewDate}
                      onChange={(e) =>
                        handleSettingChange("showReviewDate", e.target.checked)
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
                  <s-heading level="1">Carousel behavior</s-heading>
                  <s-stack>
                    <s-switch
                      id="Autop-on-hover"
                      label="Autoplay "
                      checked={settings.showAutoPlay}
                      onChange={(e) =>
                        handleSettingChange("showAutoPlay", e.target.checked)
                      }
                    ></s-switch>
                  </s-stack>

                  <s-stack>
                    <s-switch
                      id="Show-navigation-dots"
                      label="Show navigation dots"
                      checked={settings.showNavigationDots}
                      onChange={(e) =>
                        handleSettingChange(
                          "showNavigationDots",
                          e.target.checked,
                        )
                      }
                    ></s-switch>
                  </s-stack>

                  <s-stack>
                    <s-switch
                      id="Show arrow controls"
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

                  <s-stack
                    padding="small"
                    border="base"
                    borderRadius="large"
                    gap="small"
                  >
                    <s-heading level="3">Autoplay speed</s-heading>
                    <Range
                      onChange={(e) =>
                        handleSettingChange(
                          "autoplaySpeed",
                          Number(e.target.value),
                        )
                      }
                      unit="s"
                      defaultValue={settings?.autoplaySpeed}
                      min={2}
                      max={4}
                    />
                  </s-stack>

                  <s-stack
                    border="base"
                    paddingInlineStart="small"
                    borderRadius="base"
                    padding="small"
                  >
                    <s-select
                      label="Cards visible"
                      value={settings.cardsVisible}
                      onChange={(e) =>
                        handleSettingChange(
                          "cardsVisible",
                          Number(e.target.value),
                        )
                      }
                    >
                      <s-option value="3">3</s-option>
                      <s-option value="4">4</s-option>
                      <s-option value="5">5</s-option>
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
                      details="This option isn't shown in the preview. It will take effect on your live review widget once customers submit reviews."
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
                      key={`${picker.key}-${resetKey}`}
                      data={picker}
                      defaultColor={colorValues[picker.key]}
                      onChange={(value) =>
                        handleChangeColorPiker({ [picker.key]: value })
                      }
                    />
                  ))}
                </s-stack>
              </div>

              <div style={{ padding: "0rem 1rem 1rem 1rem" }}>
                <AdvancedCSS css={customCss} setCss={handleCssChange} />
              </div>

              <ResetToDefaults handleResetToDefaults={handleResetToDefaults} />
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
                  gridTemplateColumns="@container (inline-size > 600px) 1fr auto, 1fr"
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
                  <s-button-group gap="base">
                    <s-button slot="secondary-actions" href="http://qorix-review-docs.nextvence.com/pages/widgets/reviewreel" target="_blank">Need help?</s-button>
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
                </s-grid>
              </s-query-container>
            </div>
            {/* End----Preview Header */}
            <ReviewReelPreeview settings={settings} activeDevice={activeDevice} />
          </div>
          {/* End----Content */}
        </s-grid>
      </s-query-container>
    </>
  );
}
