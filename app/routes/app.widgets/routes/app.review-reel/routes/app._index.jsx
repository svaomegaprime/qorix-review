import { useEffect, useState } from "react";
import Loader from "../../../../../components/essentials/Loader";
import CustomSection from "../../../../../components/essentials/CustomSection";
import Text from "../../../../../components/essentials/elements/Text";
import SaveBar from "../../../components/savebar/SaveBar";
import { useSaveBarTrigger } from "../../../components/savebar/useSaveBarTrigger";
import { requestAppWindowClose } from "../../../utils/useAppWindowClose";
import { useNavigation } from "react-router";
import ColorPicker from "../../../components/elements/ColorPicker";
import Header from "../../../components/Header";
import ResetToDefaults from "../../../components/elements/ResetToDefaults";
// import ReviewReelWidget from "../component/reviewReelPreview";
 import Range from "../../../components/elements/Range";
import ReviewReelPreeview from "../component/reviewReelPreview";    
const COLOR_PICKERS_ELEMENTS = [  
  {
    key: "CARD_BACKGROUND",
    label: "Card background",
  },
  {
    key: "BADGE_COLOR",
    label: "Badge color",
  },

  {
    key: "ACTIVE_DOT_COLOR",
    label: "Active dot",
  },

];

const DEFAULT_COLOR_VALUES = {
  BADGE_COLOR: "#34C759",
  ACTIVE_DOT_COLOR: "#34C759",
  CARD_BACKGROUND: "#FFF",
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
  showReviewerName: true,
  showReviewImage: true,
  showVerifiedBadge: true,
  showProductName: true,
  showReviewDate: true,

  //-------Carousel behavior
  showAutoPlay: true,
  showNavigationDots: true,
  showArrowControls: true,
  autoplaySpeed: 4,
  cardsVisible: 3,
  fiteringMinStart: "3 star and above",

  // color piker
  startColor: DEFAULT_COLOR_VALUES.BADGE_COLOR,
  activeDotColor: DEFAULT_COLOR_VALUES.ACTIVE_DOT_COLOR,
  cardBackgorud: DEFAULT_COLOR_VALUES.CARD_BACKGROUND,
};

console.log("DEFAULT_VALUES_VIDEO_STACK", DEFAULT_VALUES_VIDEO_STACK);
export default function Index() {
  // Start----Default CSR loading state checking for navigation
  const navigation = useNavigation();
  const loading = navigation.state === "loading";
  // End----Default CSR loading state checking for navigation
  const [resetKey, setResetKey] = useState(0);

  const [activeDevice, setActiveDevice] = useState("desktop");
  const [settings, setSettings] = useState(DEFAULT_VALUES_VIDEO_STACK);

  const colorValues = {
    BADGE_COLOR: settings.startColor,
    ACTIVE_DOT_COLOR: settings.activeDotColor,
    CARD_BACKGROUND: settings.cardBackgorud,
  };

  const COLOR_KEY_MAP = {
    BADGE_COLOR: "startColor", // BADGE_COLOR → startColor
    ACTIVE_DOT_COLOR: "activeDotColor", // ACTIVE_DOT_COLOR → activeDotColor
    CARD_BACKGROUND: "cardBackgorud", // CARD_BACKGROUND → ccardBackgorud
  };

  console.log("colorValues", colorValues);
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
      startColor: DEFAULT_COLOR_VALUES.BADGE_COLOR,
      activeDotColor: DEFAULT_COLOR_VALUES.ACTIVE_DOT_COLOR,
      cardBackgorud: DEFAULT_COLOR_VALUES.CARD_BACKGROUND,
    }));
    setResetKey((prev) => prev + 1);

    setSettings(DEFAULT_VALUES_VIDEO_STACK);
  };
  console.log("settings", settings);
  const handleSettingChange = (key, value) => {
    if (typeof key !== "string") {
      console.warn("Invalid settings key:", key);
      return;
    }
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Start----Handlers for hide app window
  const handleHideAppWindow = () => {
    requestAppWindowClose("review_reel");
  };
  // End----Handlers for hide app window

  // Start----Handlers for SaveBar
  const saveBar = useSaveBarTrigger({
    onSubmit: (formData) => {
      console.log("SaveBar submit trigger:", formData);
      setTimeout(() => {
        requestAppWindowClose("review_reel");
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
                <Text as="h3">ReviewReel</Text>
                <s-badge tone="success">Installed</s-badge>
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
                      handleSettingChange("showReviewerName", e.target.checked)
                    }
                  ></s-switch>
                </s-stack>

                <s-stack>
                  <s-switch
                    id="Show reviewer image"
                    label="Show reviewer image"
                    checked={settings.showReviewImage}
                    onChange={(e) =>
                      handleSettingChange("showReviewImage", e.target.checked)
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
                    id="show-share-option"
                    label="Show product Name"
                    checked={settings.showProductName}
                    onChange={(e) =>
                      handleSettingChange("showProductName", e.target.checked)
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
                      handleSettingChange("showArrowControls", e.target.checked)
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
                      handleSettingChange("autoplaySpeed", Number(e.target.value))
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
                      handleSettingChange("cardsVisible", Number(e.target.value))
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
        <ReviewReelPreeview settings={settings} activeDevice={activeDevice} />
          {/* Start----Preview Content */}
          {/* End----Preview Content */}
        </div>

        {/* End----Content */}
      </s-grid>
    </>
  );
}
