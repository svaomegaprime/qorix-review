import { useEffect, useState } from "react";
import Loader from "../../../../../components/essentials/Loader";
import CustomSection from "../../../../../components/essentials/CustomSection";
import Text from "../../../../../components/essentials/elements/Text";
import SaveBar from "../../../components/savebar/SaveBar";
import { useSaveBarTrigger } from "../../../components/savebar/useSaveBarTrigger";
import { requestAppWindowClose } from "../../../utils/useAppWindowClose";
import { useNavigation } from "react-router";
import ColorPicker from "../../../components/elements/ColorPicker";
import QuickReviewComponent from "../componant/quickReviewPreview";
import TabButton from "../../../../../components/essentials/TabButton";

const COLOR_PICKERS_ELEMENTS = [
  {
    key: "STAR_COLOR",
    label: "Star color",
    info:"Applies to: Widget, Form & Success Screen"
  },  {
    key: "Submit_Button_Color",
    label: "Button background ",
     info:"Applies to: Widget, Form & Success Screen"
  },
  {
    key: "TEXT_COLOR",
    label: "Button text color",
     info:"Applies to: Widget, Form & Success Screen"
  },

  {
    key: "VERIFIED_BADGE_COLOR",
    label: "Verified badge color",
  },
  {
    key: "Card_Background_Color",
    label: "Card background",
  },
  {
    key: "Border_Color",
    label: "Border color",
  },
];

const DEFAULT_COLOR_VALUES = {
  STAR_COLOR: "#f59e0b",
  TEXT_COLOR: "#303030",
  VERIFIED_BADGE_COLOR: "#1D9E75",
  Card_Background_Color: "#FFFFFF",
  Border_Color: "#F0F0F0",
  Submit_Button_Color: "#1D9E75", // submit button
};

export default function Index(VALUES = {}) {
  // Start----Default CSR loading state checking for navigation
  const navigation = useNavigation();
  const loading = navigation.state === "loading";
  // End----Default CSR loading state checking for navigation
  const [borderRadius, setBorderRadius] = useState(15);
  const [activeDevice, setActiveDevice] = useState("desktop");
  const [quickReview, setQuickReview] = useState({
    name: true,
    email: false,

    photo: true,
    video: true,
    // ---from text-----
    formTitle: "How was your experience?",
    formSubtitle: "Your feedback helps others",
    submitButtonText: "Submit review",
    successMessageTitle: "Review submitted Successfully",
    successButtonText: "Countinue shopping",
    successMessage: "Thank you! Your review has been submitted.",
    // -----color --------
    colorValues: DEFAULT_COLOR_VALUES,
    borderRadius,
    //  Review list display
  showReviewerName: true,
  showReviewerImage: true,
  showProductName: false,
  showVerifiedBadge: true,
  showReviewDate: true,
  showRatingFilter: true,
  reviewPerPage: "10",
  defaultSort: "Most recent (default)",
  });

  const [activeTab, setActiveTab] = useState("PREVIEW");


  const [quickReviewTab, setquickReviewTab] = useState({
  quickReview: true,
  reviewPopup: false,
  success: false,
});

const setActiveManualTab = (activeKey) => {
  setquickReviewTab({
    quickReview: false,
    reviewPopup: false,
    success: false,
    ...activeKey,
  });
};

  console.log("quickReview", quickReview);
  // Start----Handlers for hide app window
  const handleHideAppWindow = () => {
    requestAppWindowClose("quick_review");
  };
  // End----Handlers for hide app window

  // Start----Handlers for SaveBar
  const saveBar = useSaveBarTrigger({
    onSubmit: (formData) => {
      console.log("SaveBar submit trigger:", formData);
      setTimeout(() => {
        requestAppWindowClose("quick_review");
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

  const handleSwitch = (field) => (e) => {
    setQuickReview((prev) => ({ ...prev, [field]: e.target.checked }));
  };

  //   --------Form text Funtion------------
  const handleText = (field) => (e) => {
    setQuickReview((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handelQoucikReview = (e) => {
    setQuickReview((prev) => ({
      ...prev,
      colorValues: {
        ...prev.colorValues,
        ...e,
      },
    }));
  };

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
                <Text as="h3">QuickReview</Text>
                <s-badge tone="caution">Not installed</s-badge>
              </s-stack>
              <s-paragraph color="subdued">
                Show a quick review form on your product page.
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
            <div style={{ padding: "20px" }}>
            {/* ------------Tab buttons--------------- */}
          <s-grid
  gridTemplateColumns="1fr 1fr 1fr"
  gap="base"
  paddingBlockEnd="base"
>
  <TabButton
    isActive={quickReviewTab.quickReview}
    onClick={() => setActiveManualTab({ quickReview: true })}
  >
   Widget
  </TabButton>
  <TabButton
    isActive={quickReviewTab.reviewPopup}
    onClick={() => setActiveManualTab({ reviewPopup: true })}
  >
     Form
  </TabButton>
  <TabButton
    isActive={quickReviewTab.success}
    onClick={() => setActiveManualTab({ success: true })}
  >
    Success
  </TabButton>
          </s-grid>
              {/* ---------------Form fields-------------------- */}

              {quickReviewTab.reviewPopup && (
                 <>
              <s-stack border="base" borderRadius="base" padding="base">
                <s-heading>Form Fields</s-heading>
                <br />
                <s-switch
                  checked={quickReview.name || undefined}
                  label="Name field"
                  details="Ask for reviewer's name"
                  onchange={handleSwitch("name")}
                ></s-switch>
                <s-switch
                  checked={quickReview.email || undefined}
                  label="Email field"
                  details="Optional email for reply"
                  onchange={handleSwitch("email")}
                ></s-switch>
           
                <s-switch
                  checked={quickReview.photo || undefined}
                  label="Photo upload"
                  details="Let customers attach images"
                  onchange={handleSwitch("photo")}
                ></s-switch>
                <s-switch
                  checked={quickReview.video || undefined}
                  label="Video upload"
                  details="Let customers attach video"
                  onchange={handleSwitch("video")}
                ></s-switch>
              </s-stack>
              {/* ---------------Form fields End-------------------- */}
              <br></br>
              {/* ---------------Form text-------------------- */}
              <s-stack border="base" borderRadius="base" padding="base">
                <s-heading>Form text</s-heading>

                <s-stack gap="small" paddingBlockStart="small"></s-stack>
                <s-stack
                  border="base"
                  paddingInlineStart="small"
                  borderRadius="base"
                  padding="small"
                >
                  <s-text-field
                    label="Form title"
                    value={quickReview.formTitle}
                    onchange={handleText("formTitle")}
                  ></s-text-field>
                </s-stack>

                <s-stack gap="small" paddingBlockStart="small"></s-stack>
                <s-stack
                  border="base"
                  paddingInlineStart="small"
                  borderRadius="base"
                  padding="small"
                >
                  <s-text-field
                    label="Form subtitle"
                    value={quickReview.formSubtitle}
                    onchange={handleText("formSubtitle")}
                  ></s-text-field>
                </s-stack>

                <s-stack gap="small" paddingBlockStart="small"></s-stack>
                <s-stack
                  border="base"
                  paddingInlineStart="small"
                  borderRadius="base"
                  padding="small"
                >
                  <s-text-field
                    label="Submit button text"
                    value={quickReview.submitButtonText}
                    onchange={handleText("submitButtonText")}
                  ></s-text-field>
                </s-stack>

             
              </s-stack>
                <br></br>

           
              
              {/* --------------laout popup-------------------- */}
                 <s-stack
                border="base"
                borderRadius="base"
                padding="base"
                gap="small"
              >
                <s-heading>Layout</s-heading>

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
                      Border radius
                    </p>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <input
                        type="range"
                        min={0}
                        max={25}
                        value={quickReview?.borderRadius}
                        onChange={(e) =>
                          setQuickReview((prev) => ({
                            ...prev,
                            borderRadius: Number(e.target.value),
                          }))
                        }
                        style={{
                          flex: 1,
                          height: 4,
                          appearance: "none",
                          WebkitAppearance: "none",
                          background: `linear-gradient(to right, #8c8c8c ${quickReview.borderRadius * 4}%, #e4e5e7 ${quickReview.borderRadius * 2}%)`,
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
                        {quickReview.borderRadius}px
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
              </s-stack>

             </>
              )}
             
                 {quickReviewTab?.success && (
                   <s-stack>
                 <s-stack gap="small" paddingBlockStart="small"></s-stack>
                <s-stack
                  border="base"
                  paddingInlineStart="small"
                  borderRadius="base"
                  padding="small"
                >
                  <s-text-field
                    label="Success Title"
                    value={quickReview?.successMessageTitle}
                    onchange={handleText("successMessageTitle")}
                  ></s-text-field>
                </s-stack>

                     <s-stack gap="small" paddingBlockStart="small"></s-stack>
                <s-stack
                  border="base"
                  paddingInlineStart="small"
                  borderRadius="base"
                  padding="small"
                >
                  <s-text-field
                    label="Success message"
                    value={quickReview?.successMessage}
                    onchange={handleText("successMessage")}
                  ></s-text-field>
                </s-stack>


                 <s-stack gap="small" paddingBlockStart="small"></s-stack>
                <s-stack
                  border="base"
                  paddingInlineStart="small"
                  borderRadius="base"
                  padding="small"
                >
                  <s-text-field
                    label="Button Text"
                    value={quickReview?.successButtonText}
                    onchange={handleText("successButtonText")}
                  ></s-text-field>
                </s-stack>

                </s-stack>
               )}
              {/* ---------------Form text End-------------------- */}
              {/* -------------Review list display--------------- */}
             {quickReviewTab?.quickReview && (
                   <s-stack border="base" borderRadius="base" padding="base" gap="small">
  <s-heading>Review list display</s-heading>

  <s-switch
    label="Show reviewer name"
    checked={quickReview.showReviewerName || undefined}
    onchange={handleSwitch("showReviewerName")}
  />
  <s-switch
    label="Show reviewer image"
    checked={quickReview.showReviewerImage || undefined}
    onchange={handleSwitch("showReviewerImage")}
  />
  <s-switch
    label="Show product name"
    checked={quickReview.showProductName || undefined}
    onchange={handleSwitch("showProductName")}
  />
  <s-switch
    label="Show verified badge"
    checked={quickReview.showVerifiedBadge || undefined}
    onchange={handleSwitch("showVerifiedBadge")}
  />
  <s-switch
    label="Show review date"
    checked={quickReview.showReviewDate || undefined}
    onchange={handleSwitch("showReviewDate")}
  />
  <s-switch
    label="Show rating filter"
    checked={quickReview.showRatingFilter || undefined}
    onchange={handleSwitch("showRatingFilter")}
  />

  <s-stack border="base" borderRadius="base" padding="small">
    <s-select
      label="Review per page"
      value={quickReview.reviewPerPage}
      onchange={(e) =>
        setQuickReview((prev) => ({ ...prev, reviewPerPage: e.target.value }))
      }
    >
      <s-option value="6">6</s-option>
      <s-option value="10">10</s-option>
      <s-option value="16">16</s-option>
      <s-option value="20">20</s-option>
      <s-option value="24">24</s-option>
    </s-select>
  </s-stack>

  <s-stack border="base" borderRadius="base" padding="small">
    <s-select
      label="Default sort"
      value={quickReview.defaultSort}
      onchange={(e) =>
        setQuickReview((prev) => ({ ...prev, defaultSort: e.target.value }))
      }
    >
      <s-option value="Most recent (default)">Most recent (default)</s-option>
      <s-option value="Highest rating">Highest rating</s-option>
      <s-option value="Only pictures">Only pictures</s-option>
      <s-option value="Pictures first">Pictures first</s-option>
      <s-option value="Most helpful">Most helpful</s-option>
    </s-select>
  </s-stack>
            </s-stack>
             )}
              {/* -------------color picker---------------- */}
              <br></br>
              <s-stack
                border="base"
                borderRadius="base"
                padding="base"
                gap="small"
              >
                <s-heading>Colors</s-heading>
                {COLOR_PICKERS_ELEMENTS.map((picker) => (
                  <ColorPicker
                    key={picker.key}
                    data={picker}
                    defaultColor={
                      VALUES[picker.key] ?? quickReview?.colorValues[picker.key]
                    }
                    onChange={(value) =>
                      handelQoucikReview({ [picker.key]: value })
                    }
                  />
                ))}
                
              </s-stack>
            

              {/* -------------Layout picker---------------- */}
           
          
         
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
              <QuickReviewComponent quickReviewTab={quickReviewTab}  quickReview={quickReview}/>
          {/* Start----Preview Content */}
          {/* End----Preview Content */}
        </div>
        {/* End----Content */}
      </s-grid>
    </>
  );
}
