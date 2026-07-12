import { useEffect, useState } from "react";
import Loader from "../../../../../components/essentials/Loader";
import CustomSection from "../../../../../components/essentials/CustomSection";
import Text from "../../../../../components/essentials/elements/Text";
import SaveBar from "../../../components/savebar/SaveBar";
import { useSaveBarTrigger } from "../../../components/savebar/useSaveBarTrigger";
import { requestAppWindowClose } from "../../../utils/useAppWindowClose";
import { useNavigation } from "react-router";
import ColorPicker from "../../../components/elements/ColorPicker";
import Range from "../../../components/elements/Range";
import Header from "../../../components/Header";
import ResetToDefaults from "../../../components/elements/ResetToDefaults";
import VideoStackWidget from "../component/videoStackPreview";
const COLOR_PICKERS_ELEMENTS = [
  {
    key: "STAR_COLOR",
    label: "Star color",
  },
    {
    key: "BADGE_COLOR",
    label: "Badge color",
  },

  {
    key: "ACTIVE_DOT_COLOR",
    label: "Active dot",
  },
  {
    key: "OVERLAY_TINT_COLOR",
    label: "Overlay tint",
  },
];

const DEFAULT_COLOR_VALUES = {
  STAR_COLOR: "#F59E0B",
  ACTIVE_DOT_COLOR: "#34C759",
  BADGE_COLOR: "#34C759",
  OVERLAY_TINT_COLOR: "#1A1A1A",
};

const DEFAULT_VALUES_VIDEO_STACK = {
  // Header option

  showHeader: true,
  headerStyle: "center",
  eyebrowLabel: "CUSTOMER REVIEWS",
  heading: "Real reviews from real people",
  subheading: "Watch and hear what our customers have to say.",
  reviewStats: "Show review count & verified badge",

  // Display elements
  showStarDistribution: true,
  showReviewerName: true,
  showReviewTextBelow: true,
  showVerifiedBadge: true,
  showVideoDuration: true,
  showProductName: true,

  // Video behavior
  showLoopVideo: true,
  mutedByDefault: true,
  autoplayOnHover: true,

  //-------Carousel behavior
  showNavigationDots: true,
  showArrowControls: true,
  thumbnailsShown: 5,
  fiteringMinStart: "3 star and above",

  // color piker
  startColor: DEFAULT_COLOR_VALUES.STAR_COLOR,
  activeDotColor: DEFAULT_COLOR_VALUES.ACTIVE_DOT_COLOR,
  badgeColor: DEFAULT_COLOR_VALUES.BADGE_COLOR,
  overlayTintColor: DEFAULT_COLOR_VALUES.OVERLAY_TINT_COLOR,
};
export default function Index() {
  // Start----Default CSR loading state checking for navigation
  const navigation = useNavigation();
  const loading = navigation.state === "loading";
  // End----Default CSR loading state checking for navigation
  const [resetKey, setResetKey] = useState(0);
  const [activeDevice, setActiveDevice] = useState("desktop");
  const [settings, setSettings] = useState(DEFAULT_VALUES_VIDEO_STACK);

  const colorValues = {
    STAR_COLOR: settings.startColor,
    ACTIVE_DOT_COLOR: settings.activeDotColor,
    OVERLAY_TINT_COLOR: settings.overlayTintColor,
    BADGE_COLOR: settings.badgeColor,
  };

  const COLOR_KEY_MAP = {
    STAR_COLOR: "startColor", // STAR_COLOR → startColor
    ACTIVE_DOT_COLOR: "activeDotColor", // ACTIVE_DOT_COLOR → activeDotColor
    OVERLAY_TINT_COLOR: "overlayTintColor", // OVERLAY_TINT_COLOR → overlayTintColor
    BADGE_COLOR: "badgeColor", // BADGE_COLOR → badgeColor
  };

  const handleChangeColorPiker = (newColor) => {
    const [key, value] = Object.entries(newColor)[0];
    setSettings((prev) => ({
      ...prev,
      [COLOR_KEY_MAP[key]]: value,
    }));
  };

  const handleResetToDefaults = () => {
    setSettings((prev) => ({
      ...prev,
      startColor: DEFAULT_COLOR_VALUES.STAR_COLOR,
      activeDotColor: DEFAULT_COLOR_VALUES.ACTIVE_DOT_COLOR,
      overlayTintColor: DEFAULT_COLOR_VALUES.OVERLAY_TINT_COLOR,
      badgeColor: DEFAULT_COLOR_VALUES.BADGE_COLOR,
    }));
    setResetKey((prev) => prev + 1);

    setSettings(DEFAULT_VALUES_VIDEO_STACK);
  };

  const handleSettingChange = (key, value) => {
    if (typeof key !== "string") {
      console.warn("Invalid settings key:", key);
      return;
    }
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Start----Handlers for hide app window
  const handleHideAppWindow = () => {
    requestAppWindowClose("video_stack");
  };
  // End----Handlers for hide app window

  // Start----Handlers for SaveBar
  const saveBar = useSaveBarTrigger({
    onSubmit: (formData) => {
      setTimeout(() => {
        requestAppWindowClose("video_stack");
      }, 2000);
    },
    onDiscard: (formData) => {
      console.log("SaveBar discard trigger:", formData);
    },
  });
  // End----Handlers for SaveBar

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
      {/* <s-button onClick={saveBar.triggerChange}>Change one</s-button>
            <s-button onClick={saveBar.triggerChange}>Change two</s-button>
            <s-button onClick={saveBar.triggerSubmit}>Submit trigger</s-button>
            <s-button onClick={saveBar.triggerDiscard}>Discard trigger</s-button> */}

      <SaveBar saveBar={saveBar} />
      <s-grid gridTemplateColumns="346px 1fr" alignItems="start">
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
                      handleSettingChange("showReviewerName", e.target.checked)
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
                      handleSettingChange("showVerifiedBadge", e.target.checked)
                    }
                  ></s-switch>
                </s-stack>

                <s-stack>
                  <s-switch
                    id="show-media-asset"
                    label="Show video duration"
                    checked={settings.showVideoDuration}
                    onChange={(e) =>
                      handleSettingChange("showVideoDuration", e.target.checked)
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
                      handleSettingChange("autoplayOnHover", e.target.checked)
                    }
                  ></s-switch>
                </s-stack>

                <s-stack>
                  <s-switch
                    id="Muted-by-default"
                    label="Muted by default"
                    checked={settings.mutedByDefault}
                    onChange={(e) =>
                      handleSettingChange("mutedByDefault", e.target.checked)
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
                      handleSettingChange("showArrowControls", e.target.checked)
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
                      handleSettingChange("fiteringMinStart", e.target.value)
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
          <div
            style={{
              height: "76px",
              display: "grid",
              alignItems: "center",
              borderBottom: "1px solid #e4e4e4ff",
            }}
          >
            <s-grid
              gridTemplateColumns="1fr auto"
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
          </div>
          {/* End----Preview Header */}
          <VideoStackWidget settings={settings} activeDevice={activeDevice} />
          {/* Start----Preview Content */}
          {/* End----Preview Content */}
        </div>
        {/* End----Content */}
      </s-grid>
    </>
  );
}
