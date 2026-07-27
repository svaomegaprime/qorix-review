import { useEffect, useRef, useState } from "react";
import { useNavigation, useLoaderData, useFetcher } from "react-router";

import Loader from "../../../../../components/essentials/Loader";
import CustomSection from "../../../../../components/essentials/CustomSection";
import Text from "../../../../../components/essentials/elements/Text";
import SaveBar from "../../../components/savebar/SaveBar";
import { useSaveBarTrigger } from "../../../components/savebar/useSaveBarTrigger";
import { requestAppWindowClose } from "../../../utils/useAppWindowClose";
import ColorPicker from "../../../components/elements/ColorPicker";
import Header from "../../../components/Header";
import ResetToDefaults from "../../../components/elements/ResetToDefaults";
import VideoStackWidget from "../component/videoStackPreview";
import AdvanceCSS from "../../../components/elements/AdvanceCSS";

// ---- server-only imports, only used inside loader/action ----
import prisma from "../../../../../db.server"; // adjust to your actual prisma client path
import { authenticate } from "../../../../../shopify.server"; // adjust to your actual auth path
import { adminErrorResponse } from "../../../../../utils/adminError.server";
import { setAppMetafield } from "../../../../../utils/appMetafields.server";
import { getStoreData } from "../../../../../utils/getStoreData";
import {
  COLOR_PICKERS_ELEMENTS,
  DEFAULT_VALUES_VIDEO_STACK,
} from "../data/videoStackDefaultData";

// Shudhu eituku list-e thaka key gulai DB column, eta ekbar likhe rakle
// mapper function 2ta ekhane sync thakbe.
const SETTINGS_KEYS = Object.keys(DEFAULT_VALUES_VIDEO_STACK);

function cloneSettings(settings) {
  return JSON.parse(JSON.stringify(settings));
}

// DB row -> front-end settings object. row na thakle default dibe.
function dbRowToSettings(row) {
  if (!row) {
    return { ...DEFAULT_VALUES_VIDEO_STACK };
  }
  const settings = {};
  for (const key of SETTINGS_KEYS) {
    settings[key] =
      row[key] !== undefined && row[key] !== null
        ? row[key]
        : DEFAULT_VALUES_VIDEO_STACK[key];
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

  // <s-select> string dey ("3" / "5"), DB column Int
  if (dbFields.thumbnailsShown !== undefined) {
    dbFields.thumbnailsShown = Number(dbFields.thumbnailsShown);
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

    const row = await prisma.videoStackSettings.findUnique({
      where: { shop },
    });

    return dbRowToSettings(row); // row null hole DEFAULT_VALUES_VIDEO_STACK return kore
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
    const { admin, session } = await authenticate.admin(request);
    const { id: shop } = await getStoreData(admin);
    const data = await request.json();

    const dbFields = settingsToDbFields(data);

    const res = await prisma.videoStackSettings.upsert({
      where: { shop },
      update: dbFields,
      create: {
        shop,
        ...dbFields,
      },
    });

    const settingsForMetafield = dbRowToSettings(res);
    await setAppMetafield(admin, "video_stack", settingsForMetafield);

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

  const [resetKey, setResetKey] = useState(0);
  const [activeDevice, setActiveDevice] = useState("desktop");
  const [settings, setSettings] = useState({
    ...DEFAULT_VALUES_VIDEO_STACK,
    ...loaderData,
  });
  const [customCss, setCss] = useState(
    (loaderData && loaderData.advanceCss) ||
      DEFAULT_VALUES_VIDEO_STACK.advanceCss ||
      "",
  );
  const initSettingsRef = useRef(null);
  const savePendingRef = useRef(false);

  const colorValues = {
    STAR_COLOR: settings.startColor,
    ACTIVE_DOT_COLOR: settings.activeDotColor,
    OVERLAY_TINT_COLOR: settings.overlayTintColor,
    BADGE_COLOR: settings.badgeColor,
  };

  const COLOR_KEY_MAP = {
    STAR_COLOR: "startColor",
    ACTIVE_DOT_COLOR: "activeDotColor",
    OVERLAY_TINT_COLOR: "overlayTintColor",
    BADGE_COLOR: "badgeColor",
  };

  const handleChangeColorPiker = (newColor) => {
    const [key, value] = Object.entries(newColor)[0];
    setSettings((prev) => ({
      ...prev,
      [COLOR_KEY_MAP[key]]: value,
    }));
  };

  const handleResetToDefaults = () => {
    const defaults = { ...DEFAULT_VALUES_VIDEO_STACK };
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
    requestAppWindowClose("video_stack");
  };
  // End----Handlers for hide app window

  // Start----Handlers for SaveBar
  if (initSettingsRef.current === null) {
    initSettingsRef.current = cloneSettings({
      ...DEFAULT_VALUES_VIDEO_STACK,
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
    return <Loader />;
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
            margin: 0 auto;
          }

          .sidebar-content {
            height: calc(100vh - 77px);
            overflow: hidden auto;
            background: #fff;
            padding: 1rem;
          }

          @media (max-width: 900px) {
            .sidebar-content {
              height: auto;
              overflow: visible;
              padding: 0.75rem;
            }

            .review-item {
              height: 200px;
              width: 70%;
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
                  <Text as="h3">VidoeStack</Text>
                  <s-badge tone="caution">Not installed</s-badge>
                </s-stack>
                <s-paragraph color="subdued">
                  Showcase your videos in a beautiful slide show
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
                      id="Show-review-text-below"
                      label="Show review text below"
                      checked={settings.showReviewTextBelow}
                      onChange={(e) =>
                        handleSettingChange(
                          "showReviewTextBelow",
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
                      label="Show video duration"
                      checked={settings.showVideoDuration}
                      onChange={(e) =>
                        handleSettingChange(
                          "showVideoDuration",
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
                </s-stack>
              </div>
              {/* ----------Display Elements end ------------ */}

              <div style={{ padding: "1rem" }}>
                <s-stack
                  border="base"
                  borderRadius="base"
                  padding="large"
                  gap="small"
                >
                  <s-heading level="1">Video behavior</s-heading>
                  <s-stack>
                    <s-switch
                      id="Autop-on-hover"
                      label="Autoplay on hover"
                      checked={settings.autoplayOnHover}
                      onChange={(e) =>
                        handleSettingChange(
                          "autoplayOnHover",
                          e.target.checked,
                        )
                      }
                    ></s-switch>
                  </s-stack>

                  <s-stack>
                    <s-switch
                      id="Muted-by-default"
                      label="Muted by default"
                      checked={settings.mutedByDefault}
                      onChange={(e) =>
                        handleSettingChange(
                          "mutedByDefault",
                          e.target.checked,
                        )
                      }
                    ></s-switch>
                  </s-stack>

                  <s-stack>
                    <s-switch
                      id="Loop-video"
                      label="Loop video"
                      checked={settings.showLoopVideo}
                      onChange={(e) =>
                        handleSettingChange("showLoopVideo", e.target.checked)
                      }
                    ></s-switch>
                  </s-stack>
                </s-stack>
              </div>

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
                    border="base"
                    paddingInlineStart="small"
                    borderRadius="base"
                    padding="small"
                  >
                    <s-select
                      label="Thumbnails shown"
                      value={settings.thumbnailsShown}
                      onChange={(e) =>
                        handleSettingChange("thumbnailsShown", e.target.value)
                      }
                    >
                      <s-option value="3">3</s-option>
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
                      value={settings.fiteringMinStart}
                      details="This option isn't shown in the preview. It will take effect on your live review widget once customers submit reviews."
                      onChange={(e) =>
                        handleSettingChange(
                          "fiteringMinStart",
                          e.target.value,
                        )
                      }
                    >
                      <s-option value="Show all ratings">
                        Show all ratings
                      </s-option>
                      <s-option value="3 star and above">
                        3 star and above
                      </s-option>
                      <s-option value="4 star and above">
                        4 star and above
                      </s-option>
                      <s-option value="5 star only">5 star only</s-option>
                    </s-select>
                    <br></br>
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
                <AdvanceCSS css={customCss} setCss={handleCssChange} />
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
            <VideoStackWidget settings={settings} activeDevice={activeDevice} />
            {/* Start----Preview Content */}
            {/* End----Preview Content */}
          </div>
          {/* End----Content */}
        </s-grid>
      </s-query-container>
    </>
  );
}
