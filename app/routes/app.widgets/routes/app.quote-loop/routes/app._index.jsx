import { useEffect, useState } from "react";
import Loader from "../../../../../components/essentials/Loader";
import CustomSection from "../../../../../components/essentials/CustomSection";
import Text from "../../../../../components/essentials/elements/Text";
import SaveBar from "../../../components/savebar/SaveBar";
import { useSaveBarTrigger } from "../../../components/savebar/useSaveBarTrigger";
import { requestAppWindowClose } from "../../../utils/useAppWindowClose";
import { useNavigation } from "react-router";
import Header from "../../../components/Header";
import ColorPicker from "../../../components/elements/ColorPicker";
import QuoteLoopWidget from "../component/quite_loop_preview";

const COLOR_PICKERS_ELEMENTS = [
  {
    key: "Card_Background_Color",
    label: "Card background",
  },

  {
    key: "TEXT_COLOR",
    label: "Review text",
  },
  {
    key: "QUOTE_MARK_COLOR",
    label: "Quote mark colorr",
  },
  
  {
    key: "STAR_COLOR",
    label: "Star color",
  },
];

const DEFAULT_COLOR_VALUES = {
  STAR_COLOR: "#F59E0B",
  TEXT_COLOR: "#303030",
  QUOTE_MARK_COLOR: "#1D9E75",
  Card_Background_Color: "#FFFFFF",
};

export default function Index(VALUES = {}) {
  // Start----Default CSR loading state checking for navigation
  const navigation = useNavigation();
  const loading = navigation.state === "loading";
  // End----Default CSR loading state checking for navigation

  const [activeDevice, setActiveDevice] = useState("desktop");

  const [settings, setSettings] = useState({
    // Header option

    showHeader: true,
    headerStyle: "center", // default active
    eyebrowLabel: "CUSTOMER REVIEWS",
    heading: "Real reviews from real people",
    subheading: "Watch and hear what our customers have to say.",
    reviewStats: "Show review count & verified badge",

    // Display elements and loop beahavior
    showStarDistribution: true,
    showReviewerName: true,
    showQuoteMarkIcon: true,
    showVerifiedBadge: true,
    showMediaAsset: true,
    showArrowControls: true,
    showRotate:true,
    showAppreciationOption: true,
    speed:"2",
    transition: "Slide horizontal",
    filterSorting: "Filter & sorting both",
    fiteringMinStart: "3 star and above",
    reviewStats: "Show review count & verified badge",

    // color piker
    colors: DEFAULT_COLOR_VALUES,
  });

  const handleChangeColors = (e) => {
    handleSettingChange("colors", {
      ...settings.colors,
      ...e,
    });
  };
  const handleSettingChange = (key, value) => {
    if (typeof key !== "string") {
      console.warn("Invalid settings key:", key);
      return;
    }
    setSettings((prev) => ({ ...prev, [key]: value }));
  };
  122;
  console.log("settings", settings);

  // Start----Handlers for hide app window
  const handleHideAppWindow = () => {
    requestAppWindowClose("quote_loop");
  };
  // End----Handlers for hide app window

  // Start----Handlers for SaveBar
  const saveBar = useSaveBarTrigger({
    onSubmit: (formData) => {
      console.log("SaveBar submit trigger:", formData);
      setTimeout(() => {
        requestAppWindowClose("quote_loop");
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
                <Text as="h3">QuoteLoop</Text>
                <s-badge tone="caution">Not installed</s-badge>
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
            }}
          >
            {/* Start----Sidebar content */}

            {/* ----------Display Elements start ------------ */}
            <div style={{ padding: "1rem"}}>
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
                    id="show-quote-mark-icon"
                    label="Show quote mark icon"
                    checked={settings.showQuoteMarkIcon}
                    onChange={(e) =>
                      handleSettingChange("showQuoteMarkIcon", e.target.checked)
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
                    label="Show nav dots"
                    checked={settings.showNavDots}
                    onChange={(e) =>
                      handleSettingChange("showNavDots", e.target.checked)
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
                      handleSettingChange("showArrowControls", e.target.checked)
                    }
                  ></s-switch>
                </s-stack>

                    <s-stack>
                  <s-switch
                    id="auto-rotate"
                    label="Auto-rotate"
                    checked={settings.showRotate}
                    onChange={(e) =>
                      handleSettingChange("showRotate", e.target.checked)
                    }
                  ></s-switch>
                </s-stack>

                <s-stack>
                  <div
                    style={{
                      border: "1px solid #e4e5e7",
                      borderRadius: 8,
                      padding: "12px 16px",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 10px",
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#202223",
                      }}
                    >
                     Autoplay speed
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <input
                        type="range"
                        min={0}
                        max={5}
                        value={settings?.speed}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            speed: Number(e.target.value),
                          }))
                        }
                        style={{
                          flex: 1,
                          height: 4,
                          appearance: "none",
                          WebkitAppearance: "none",
                          background: `linear-gradient(to right, #8c8c8c ${settings?.speed * 20}%, #e4e5e7 ${settings?.speed * 2}%)`,
                          borderRadius: 2,
                          outline: "none",
                          cursor: "pointer",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 13,
                          color: "#6d7175",
                          minWidth: 36,
                          textAlign: "right",
                        }}
                      >
                        {settings?.speed}s
                      </span>
                      <style>{`
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #ddd;
    border: none;
    cursor: pointer;
    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  }
`}</style>
                    </div>
                  </div>
                </s-stack>

               

                <s-stack
                  border="base"
                  paddingInlineStart="small"
                  borderRadius="base"
                  padding="small"
                >
                  <s-select
                    label="Transition"
                    value={settings.transition}
                    onChange={(e) =>
                      handleSettingChange("transition", e.target.value)
                    }
                  >
                    <s-option value="Fade">
                     Fade
                    </s-option>
                    <s-option value="Slide horizontal">Slide horizontal</s-option>
                    <s-option value="Slide vertical">Slide vertical</s-option>
                    <s-option value="Zoom">Zoom</s-option>
                    <s-option value="Flip">Flip</s-option>
                     <s-option value="None (instant)">None (instant)</s-option>

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
                    onChange={(e) =>
                      handleSettingChange("fiteringMinStart", e.target.value)
                    }
                  >
                    <s-option value="Show all ratings">Show all ratings</s-option>
                    <s-option value="3 star and above">3 star and above</s-option>
                    <s-option value="4 star and above">4 star and above</s-option>
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
          <QuoteLoopWidget />
          {/* Start----Preview Content */}
          {/* End----Preview Content */}
        </div>
        {/* End----Content */}
      </s-grid>
    </>
  );
}
