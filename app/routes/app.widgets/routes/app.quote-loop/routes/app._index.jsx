import { useEffect, useState } from "react"
import Loader from "../../../../../components/essentials/Loader"
import CustomSection from "../../../../../components/essentials/CustomSection"
import Text from "../../../../../components/essentials/elements/Text"
import SaveBar from "../../../components/savebar/SaveBar"
import { useSaveBarTrigger } from "../../../components/savebar/useSaveBarTrigger"
import { requestAppWindowClose } from "../../../utils/useAppWindowClose"
import { useNavigation } from "react-router"
import Header from "../../../components/Header";
import ColorPicker from "../../../components/elements/ColorPicker";
import QuoteLoopWidget from "../component/quite_loop_preview";

const COLOR_PICKERS_ELEMENTS = [
    {
        key: "STAR_COLOR",
        label: "Star color"
    },
    {
        key: "TEXT_COLOR",
        label: "Text color"
    },
    {
        key: "VERIFIED_BADGE_COLOR",
        label: "Verified badge color"
    },
     {
        key: "Card_Background_Color",
        label: "Card background"
    },
    {
        key: "Border_Color",
        label: "Border color"
    }
];

const DEFAULT_COLOR_VALUES = {
    STAR_COLOR: "#34C759",
    TEXT_COLOR: "#1A1A1A",
    VERIFIED_BADGE_COLOR: "#1D9E75",
    Card_Background_Color: "#FFFFFF",
    Border_Color: "#F0F0F0"
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

  // Display elements
  showStarDistribution: true,
  showReviewerName: true,
  showReviewTimer: true,
  showVerifiedBadge: true,
  showMediaAsset: true,
  showShareOption: true,
  showAppreciationOption: true,


  // Layout options
  layout: "3 column grid",
  filterSorting: "Filter & sorting both",
  reviewsPerPage: "9 reviews",
  reviewStats: "Show review count & verified badge",

  // color piker
  colors: DEFAULT_COLOR_VALUES
});

const handleChangeColors = (e) => {

         handleSettingChange("colors", {
    ...settings.colors,
    ...e,
  });
}
  const handleSettingChange = (key, value) => {
  if (typeof key !== "string") {
    console.warn("Invalid settings key:", key);
    return;
  }
  setSettings((prev) => ({ ...prev, [key]: value }));
};
122
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
        if(body) body.style.margin = "0";
        const appNav = document.querySelector("s-app-nav");
        if(appNav) appNav.remove();
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
                    <s-grid gridTemplateColumns="auto 1fr" gap="small" padding="small base">
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
                            background: "#fff"
                        }}
                    >
                        {/* Start----Sidebar content */}

                              <Header handleSettingChange={handleSettingChange} settings={settings}/>
                        
                        
                               {/* ----------Display Elements start ------------ */}
                        <div style={{ marginTop: "2rem" }}>
                          <s-stack border="base" borderRadius="base" padding="large" gap="small">
                            <s-heading level="1">Display elements</s-heading>
                        
                            <s-stack paddingBlockStart="small">
                              <s-switch
                                id="show-star-distribution"
                                label="Show star distribution bars"
                                checked={settings.showStarDistribution}
                                onChange={(e) => handleSettingChange("showStarDistribution", e.target.checked)}
                              ></s-switch>
                            </s-stack>
                        
                            <s-stack>
                              <s-switch
                                id="show-reviewer-name"
                                label="Show reviewer name"
                                checked={settings.showReviewerName}
                                onChange={(e) => handleSettingChange("showReviewerName", e.target.checked)}
                              ></s-switch>
                            </s-stack>
                        
                            <s-stack>
                              <s-switch
                                id="show-review-timer"
                                label="Show review timer"
                                checked={settings.showReviewTimer}
                                onChange={(e) => handleSettingChange("showReviewTimer", e.target.checked)}
                              ></s-switch>
                            </s-stack>
                        
                            <s-stack>
                              <s-switch
                                id="show-verified-badge"
                                label="Show verified badge"
                                checked={settings.showVerifiedBadge}
                                onChange={(e) => handleSettingChange("showVerifiedBadge", e.target.checked)}
                              ></s-switch>
                            </s-stack>
                        
                            <s-stack>
                              <s-switch
                                id="show-media-asset"
                                label="Show media asset(if available)"
                                checked={settings.showMediaAsset}
                                onChange={(e) => handleSettingChange("showMediaAsset", e.target.checked)}
                              ></s-switch>
                            </s-stack>
                        
                            <s-stack>
                              <s-switch
                                id="show-share-option"
                                label="Show share option"
                                checked={settings.showShareOption}
                                onChange={(e) => handleSettingChange("showShareOption", e.target.checked)}
                              ></s-switch>
                            </s-stack>
                        
                            <s-stack>
                              <s-switch
                                id="show-appreciation-option"
                                label="Show appreciation option"
                                checked={settings.showAppreciationOption}
                                onChange={(e) => handleSettingChange("showAppreciationOption", e.target.checked)}
                              ></s-switch>
                            </s-stack>
                          </s-stack>
                        </div>
                        {/* ----------Display Elements end ------------ */}
                        
                        
                        {/* ----------Layout option start ------------ */}
                        <div style={{ marginTop: "2rem" }}>
                          <s-stack border="base" borderRadius="base" padding="large" gap="small">
                            <s-heading level="1">Layout option</s-heading>
                        
                            <s-stack border="base" paddingInlineStart="small" borderRadius="base" padding="small">
                              <s-select
                                label="Layout"
                                value={settings.layout}
                                onChange={(e) => handleSettingChange("layout", e.target.value)}
                              >
                                <s-option value="2 column grid">2 column grid</s-option>
                                <s-option value="3 column grid">3 column grid</s-option>
                                <s-option value="4 column grid">4 column grid</s-option>
                              </s-select>
                            </s-stack>
                        
                            <s-stack border="base" paddingInlineStart="small" borderRadius="base" padding="small">
                              <s-select
                                label="Filter & sorting"
                                value={settings.filterSorting}
                                onChange={(e) => handleSettingChange("filterSorting", e.target.value)}
                              >
                                <s-option value="Filter & sorting both">Filter & sorting both</s-option>
                                <s-option value="Filter only">Filter only</s-option>
                                <s-option value="Sorting only">Sorting only</s-option>
                                <s-option value="None">None</s-option>
                              </s-select>
                            </s-stack>
                        
                            <s-stack border="base" paddingInlineStart="small" borderRadius="base" padding="small">
                              <s-select
                                label="Reviews per page"
                                value={settings.reviewsPerPage}
                                onChange={(e) => handleSettingChange("reviewsPerPage", e.target.value)}
                              >
                                <s-option value="6 reviews">6 reviews</s-option>
                                <s-option value="9 reviews">9 reviews</s-option>
                                <s-option value="12 reviews">12 reviews</s-option>
                                <s-option value="12 reviews">15 reviews</s-option>
                                <s-option value="12 reviews">18 reviews</s-option>
                                <s-option value="12 reviews">24 reviews</s-option>
                        
                        
                        
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
                                                defaultColor={VALUES[picker.key] ?? settings?.colors[picker.key]}
                                                onChange={(value) => handleChangeColors({[picker.key]: value})}
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
                        background: "#fff"
                    }}
                >
                    {/* Start----Preview Header */}
                    <div 
                        style={{
                            height: "76px",
                            display: "grid",
                            alignItems: "center",
                            borderBottom: "1px solid #e4e4e4ff"
                        }}
                    >
                        <s-grid gridTemplateColumns="1fr auto" gap="small" justifyContent="space-between" paddingInline="base">
                            <s-stack alignItems="center">
                                <s-button-group gap="none">
                                    <s-button slot="secondary-actions" icon="desktop" onClick={() => setActiveDevice("desktop")}>
                                        <div style={{ position: "absolute", top: "0", left: "0", width: "100%", height: "100%", background: activeDevice === "desktop" ? "#0000000f" : "transparent", borderRadius: "8px 0 0 8px" }}></div>
                                        Desktop preview
                                    </s-button>
                                    <s-button slot="secondary-actions" icon="mobile" onClick={() => setActiveDevice("mobile")}>
                                        <div style={{ position: "absolute", top: "0", left: "0", width: "100%", height: "100%", background: activeDevice === "mobile" ? "#0000000f" : "transparent", borderRadius: "0 8px 8px 0" }}></div>
                                        Mobile preview
                                    </s-button>
                                </s-button-group>
                            </s-stack>
                            <s-button-group gap="base">
                                <s-button slot="secondary-actions">Need help?</s-button>
                                <s-button variant="primary" slot="primary-action">
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                    }}>
                                        Preview on store <s-icon type="arrow-up-right" />
                                    </div>
                                </s-button>
                            </s-button-group>
                        </s-grid>
                    </div>
                    {/* End----Preview Header */}
                     <QuoteLoopWidget/>
                    {/* Start----Preview Content */}
                    {/* End----Preview Content */}
                </div>
                {/* End----Content */}
            </s-grid>
        </>
    )
}
