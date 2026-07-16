import { useEffect, useRef, useState } from "react";
import Loader from "../../../../../components/essentials/Loader";
import CustomSection from "../../../../../components/essentials/CustomSection";
import Text from "../../../../../components/essentials/elements/Text";
import SaveBar from "../../../components/savebar/SaveBar";
import { useSaveBarTrigger } from "../../../components/savebar/useSaveBarTrigger";
import { requestAppWindowClose } from "../../../utils/useAppWindowClose";
import { useFetcher, useLoaderData, useNavigation } from "react-router";
import ColorPicker from "../../../components/elements/ColorPicker";
import QuickReviewComponent from "../componant/quickReviewPreview";
import TabButton from "../../../../../components/essentials/TabButton";
import { authenticate } from "../../../../../shopify.server";
import prisma from "../../../../../db.server";
import { getStoreData } from "../../../../../utils/getStoreData";
import { setAppMetafield } from "../../../../../utils/appMetafields.server";
import { adminErrorResponse } from "../../../../../utils/adminError.server";
import { useAdminFetcherToast } from "../../../../../utils/useAdminFetcherToast";
import ActiveToggleHeader from "../../../../../routes/app.widgets/components/elements/ActiveToggleHeader";

const DEFAULT_COLOR_VALUES = {
  STAR_COLOR: "#f59e0b",
  BAR_FILE_COLOR:"#34C759",
  TEXT_COLOR: "#fff",
  VERIFIED_BADGE_COLOR: "#1D9E75",
  Submit_Button_Color: "#1D9E75",
};

const DEFAULT_QUICK_REVIEW_STATE = {
  name: true,
  email: false,
  photo: true,
  video: true,
  formTitle: "How was your experience?",
  formSubtitle: "Your feedback helps others",
  submitButtonText: "Submit review",
  successMessageTitle: "Review submitted!",
  successButtonText: "Continue Shopping",
  successMessage:
    "Thank you for your review. It has been submitted successfully.",
  colorValues: DEFAULT_COLOR_VALUES,
  borderRadius: 15,
  showReviewerName: true,
  showMediaImageAndVideo: true,
  showReviewerVideo: true,
  showProductName: true,
  showVerifiedBadge: true,
  showReviewDate: true,
  showRatingFilter: true,
  reviewPerPage: 10,
  isShowStarDistribution:true,
  isShowMediaStrip:true,
  isShowReviewCount:true,
  writeReviewButtonText:"Write a review",
  showHelfullButton:true,
  defaultSort: "MOST_RECENT",
  filterAndSorting: "FILTER_AND_SORT",
};

const parseBorderRadius = (value) => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value.replace("px", ""), 10);
    return Number.isNaN(parsed)
      ? DEFAULT_QUICK_REVIEW_STATE.borderRadius
      : parsed;
  }

  return DEFAULT_QUICK_REVIEW_STATE.borderRadius;
};

const buildQuickReviewState = (data) => {
  if (!data) {
    return DEFAULT_QUICK_REVIEW_STATE;
  }

  return {
    ...DEFAULT_QUICK_REVIEW_STATE,
    name: data.isShowNameField ?? DEFAULT_QUICK_REVIEW_STATE.name,
    email: data.isShowEmailField ?? DEFAULT_QUICK_REVIEW_STATE.email,
    photo: data.isPhotoUpload ?? DEFAULT_QUICK_REVIEW_STATE.photo,
    video: data.isVideoUpload ?? DEFAULT_QUICK_REVIEW_STATE.video,
    formTitle: data.formTitle ?? DEFAULT_QUICK_REVIEW_STATE.formTitle,
    formSubtitle: data.formSubtitle ?? DEFAULT_QUICK_REVIEW_STATE.formSubtitle,
    submitButtonText:
      data.submitButtonText ?? DEFAULT_QUICK_REVIEW_STATE.submitButtonText,
    successMessageTitle:
      data.successMessageTitle ??
      DEFAULT_QUICK_REVIEW_STATE.successMessageTitle,
    successButtonText:
      data.successButtonText ?? DEFAULT_QUICK_REVIEW_STATE.successButtonText,
    successMessage:
      data.successMessage ?? DEFAULT_QUICK_REVIEW_STATE.successMessage,
    colorValues: {
      ...DEFAULT_COLOR_VALUES,
      STAR_COLOR: data.starColor ?? DEFAULT_COLOR_VALUES.STAR_COLOR,
      Submit_Button_Color:
        data.buttonBackgroundColor ?? DEFAULT_COLOR_VALUES.Submit_Button_Color,
      TEXT_COLOR: data.buttonTextColor ?? DEFAULT_COLOR_VALUES.TEXT_COLOR,
      VERIFIED_BADGE_COLOR:
        data.verifiedBadgeColor ?? DEFAULT_COLOR_VALUES.VERIFIED_BADGE_COLOR,
      BAR_FILE_COLOR:
        data.barFileColor ?? DEFAULT_COLOR_VALUES.BAR_FILE_COLOR
    },
    borderRadius: parseBorderRadius(data.borderRadius),
    showReviewerName:
      data.isShowReviewerName ?? DEFAULT_QUICK_REVIEW_STATE.showReviewerName,
    showMediaImageAndVideo:
      data.isshowMediaImageAndVideo ?? DEFAULT_QUICK_REVIEW_STATE.showMediaImageAndVideo,
    showReviewerVideo:
      data.isShowReviewerVideo ?? DEFAULT_QUICK_REVIEW_STATE.showReviewerVideo,
    showProductName:
      data.isShowProductName ?? DEFAULT_QUICK_REVIEW_STATE.showProductName,
    showVerifiedBadge:
      data.isShowVerifiedBadge ?? DEFAULT_QUICK_REVIEW_STATE.showVerifiedBadge,
    showReviewDate:
      data.isShowReviewDate ?? DEFAULT_QUICK_REVIEW_STATE.showReviewDate,
    showRatingFilter:
      data.isShowRatingFilter ?? DEFAULT_QUICK_REVIEW_STATE.showRatingFilter,
    reviewPerPage:
      data.reviewPerPage ?? DEFAULT_QUICK_REVIEW_STATE.reviewPerPage,
    defaultSort: data.defaultSort ?? DEFAULT_QUICK_REVIEW_STATE.defaultSort,
    isShowStarDistribution:
      data.isShowStarDistribution ?? DEFAULT_QUICK_REVIEW_STATE.isShowStarDistribution,
    isShowMediaStrip:
      data.isShowMediaStrip ?? DEFAULT_QUICK_REVIEW_STATE.isShowMediaStrip,
    isShowReviewCount:
      data.isShowReviewCount ?? DEFAULT_QUICK_REVIEW_STATE.isShowReviewCount,
    writeReviewButtonText:
      data.writeReviewButtonText ?? DEFAULT_QUICK_REVIEW_STATE.writeReviewButtonText
    ,
    showHelfullButton:
      data.showHelfullButton ?? DEFAULT_QUICK_REVIEW_STATE.showHelfullButton,
      filterAndSorting:
        data.filterAndSorting ?? DEFAULT_QUICK_REVIEW_STATE.filterAndSorting
  };
};

const cloneQuickReviewState = (state) => JSON.parse(JSON.stringify(state));

export async function loader({ request }) {
  try {
    const { admin, session } = await authenticate.admin(request);
    const { id } = await getStoreData(admin);

    const res = await prisma.quickReviewWidget.findUnique({
      where: {
        storeId: id,
      },
    });

    return res;
  } catch (error) {
    return adminErrorResponse(error);
  }
}
export async function action({ request }) {
  try {
    const { admin, session } = await authenticate.admin(request);

    const data = await request.json();
    const { id } = await getStoreData(admin);

    const res = await prisma.quickReviewWidget.upsert({
      where: {
        storeId: id,
      },
      update: {
        ...data,
      },
      create: {
        ...data,
        store: {
          connect: {
            storeGID: id,
          },
        },
      },
    });

    const metafieldResult = await setAppMetafield(admin, "quick_review", res);

    return {
      ok: true,
      widget: res,
      metafieldResult,
    };
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export default function Index(VALUES = {}) {
  const loaderData = useLoaderData();

  const COLOR_PICKERS_ELEMENTS = [
    {
      key: "STAR_COLOR",
      label: "Star color",
      info: "",
    },
    {
      key: "BAR_FILE_COLOR",
      label: "Bar fill color",
      info: "",
    },
    {
      key: "Submit_Button_Color",
      label: "Button background ",
      info: "",
    },
    {
      key: "TEXT_COLOR",
      label: "Button text color",
      info: "",
    },

    {
      key: "VERIFIED_BADGE_COLOR",
      label: "Verified badge color",
    },
  ];

  // Start----Default CSR loading state checking for navigation
  const navigation = useNavigation();
  const loading = navigation.state === "loading";
  // End----Default CSR loading state checking for navigation
  const [activeDevice, setActiveDevice] = useState("desktop");
    const [activeToggleManu, setActiveToggleManu] = useState(false);
  const [quickReview, setQuickReview] = useState(() =>
    buildQuickReviewState(loaderData),
  );

  const postData = {
    // -------- form ----------
    isShowNameField: quickReview.name,
    isShowEmailField: quickReview.email,
    isPhotoUpload: quickReview.photo,
    isVideoUpload: quickReview.video,

    formTitle: quickReview.formTitle,
    formSubtitle: quickReview.formSubtitle,
    submitButtonText: quickReview.submitButtonText,
    isShowStarDistribution: quickReview.isShowStarDistribution,
    isShowMediaStrip: quickReview.isShowMediaStrip,
    isShowReviewCount: quickReview.isShowReviewCount,
    showHelfullButton: quickReview.showHelfullButton,
    // ---success-----
    successMessageTitle: quickReview.successMessageTitle,
    successButtonText: quickReview.successButtonText,
    successMessage: quickReview.successMessage,
    // ----color--------
    starColor: quickReview.colorValues.STAR_COLOR,
    buttonBackgroundColor: quickReview.colorValues.Submit_Button_Color,
    buttonTextColor: quickReview.colorValues.TEXT_COLOR,
    verifiedBadgeColor: quickReview.colorValues.VERIFIED_BADGE_COLOR,
    // -------------- widget ---------
    borderRadius: `${quickReview.borderRadius}px`,

    isShowReviewerName: quickReview.showReviewerName,
    isshowMediaImageAndVideo: quickReview.showMediaImageAndVideo,
    isShowReviewerVideo: quickReview.showReviewerVideo,
    isShowProductName: quickReview.showProductName,
    isShowVerifiedBadge: quickReview.showVerifiedBadge,
    isShowReviewDate: quickReview.showReviewDate,
    isShowRatingFilter: quickReview.showRatingFilter,
    writeReviewButtonText: quickReview.writeReviewButtonText,
    reviewPerPage: Number(quickReview.reviewPerPage),
    defaultSort: quickReview.defaultSort,
    filterAndSorting: quickReview.filterAndSorting,
  };
  const fetcher = useFetcher();
  useAdminFetcherToast(fetcher);
  const initQuickReviewRef = useRef(null);
  const savePendingRef = useRef(false);

  if (initQuickReviewRef.current === null) {
    initQuickReviewRef.current = cloneQuickReviewState(quickReview);
  }

  console.log("quickReview", quickReview);
  const handelSubmit = () => {
    savePendingRef.current = true;
    fetcher.submit(postData, {
      method: "post",
      encType: "application/json",
    });
    // requestAppWindowClose("quick_review");
  };

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

  // Start----Handlers for hide app window
  const handleHideAppWindow = () => {
    requestAppWindowClose("quick_review");
  };
  // End----Handlers for hide app window

  // Start----Handlers for SaveBar
  const saveBar = useSaveBarTrigger({
    onSubmit: () => {
      handelSubmit();
    },
    onDiscard: () => {
      setQuickReview(cloneQuickReviewState(initQuickReviewRef.current));
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

    initQuickReviewRef.current = cloneQuickReviewState(quickReview);
    savePendingRef.current = false;
  }, [fetcher.data, fetcher.state, quickReview]);

  useEffect(() => {
    const hasChanged =
      JSON.stringify(quickReview) !==
      JSON.stringify(initQuickReviewRef.current);

    if (hasChanged) {
      saveBar.triggerChange();
    } else {
      saveBar.triggerDiscard({ silent: true });
    }
  }, [quickReview, saveBar.triggerChange, saveBar.triggerDiscard]);

  // Start----Hide app window padding and remove app nav
  useEffect(() => {
    const body = document.querySelector("body");
    if (body) body.style.margin = "0";
    const appNav = document.querySelector("s-app-nav");
    if (appNav) appNav.remove();
  }, []);
  // End----Hide app window padding and remove app nav

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
  if (loading) {
    return <Loader />; // Show loader while navigating to this page or when loader is fetching data
  }

  return (
    <>
     <style>
        {`
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

      {/* <s-button onClick={saveBar.triggerChange}>Change one</s-button>
            <s-button onClick={saveBar.triggerChange}>Change two</s-button>
            <s-button onClick={saveBar.triggerSubmit}>Submit trigger</s-button>
            <s-button onClick={saveBar.triggerDiscard}>Discard trigger</s-button> */}

      <SaveBar saveBar={saveBar} />
      <s-query-container>
      <s-grid   gridTemplateColumns="@container (inline-size > 900px) 346px 1fr, 1fr" alignItems="start">
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
                   
                <ActiveToggleHeader activeToggleManu={activeToggleManu} textHeader="Form Fields"  activeToggleManuText={"Form_Fields"} setActiveToggleManu={setActiveToggleManu} />


                    {activeToggleManu==="Form_Fields" && (
                           <s-stack>
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
                    )}

               
                  </s-stack>
                  {/* ---------------Form fields End-------------------- */}
                  <br></br>
                  {/* ---------------Form text-------------------- */}
                  <s-stack border="base" borderRadius="base" padding="base">
                  
                      <ActiveToggleHeader activeToggleManu={activeToggleManu} textHeader="Form text"  activeToggleManuText={"Form"} setActiveToggleManu={setActiveToggleManu} />
                    
                    {activeToggleManu=="Form" && (
                                  <s-stack  paddingBlockStart="small">
                    
                    <s-stack
                      border="base"
                      paddingInlineStart="small"
                      borderRadius="base"
                      padding="small"
                    >
                      <s-text-field
                        label="Form title"
                        maxlength="70"
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
                        maxlength="70"
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
                        maxlength="50"
                        value={quickReview.submitButtonText}
                        onchange={handleText("submitButtonText")}
                      ></s-text-field>
                    </s-stack>
                    </s-stack>

                    )}
          
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
                          Form Border radius
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
                      maxlength="70"
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
                      maxlength="120"
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
                      maxlength="60"
                      value={quickReview?.successButtonText}
                      onchange={handleText("successButtonText")}
                    ></s-text-field>
                  </s-stack>
                </s-stack>
              )}
              {/* ---------------Form text End-------------------- */}
              {/* -------------Review list display--------------- */}
              {quickReviewTab?.quickReview && (
                <s-stack >

                  {/* Summary header */}
                 <s-stack
                  border="base"
                  borderRadius="base"
                  padding="base"
                  gap="small"
                >
                  <ActiveToggleHeader activeToggleManu={activeToggleManu} textHeader="Summary header"   activeToggleManuText={"Summary"} setActiveToggleManu={setActiveToggleManu} />
                 
                 

                 {activeToggleManu=="Summary" && (
                       <s-stack gap="small" paddingBlockStart="small">
                  <s-switch
                    label="Show star distribution bars"
                    checked={quickReview.isShowStarDistribution || undefined}
                    onchange={handleSwitch("isShowStarDistribution")}
                  />
                  <s-switch
                    label="Show media strip"
                    checked={quickReview.isShowMediaStrip || undefined}
                    onchange={handleSwitch("isShowMediaStrip")}
                  />
                  <s-switch
                    label="Show review count"
                    checked={quickReview.isShowReviewCount || undefined}
                    onchange={handleSwitch("isShowReviewCount")}
                  />
                  
                  <s-stack border="base" borderRadius="base" padding="small">
                    <s-text-field
                      label="Button text"
                      maxlength="25"
                      defaultValue={quickReview?.writeReviewButtonText}
                      value={quickReview?.writeReviewButtonText}
                      onchange={handleText("writeReviewButtonText")}
                    ></s-text-field>
                  </s-stack>
              
                       </s-stack>
            
                 )}
             

              
                </s-stack>

              <br></br>
                <s-stack
                  border="base"
                  borderRadius="base"
                  padding="base"
                  gap="small"
                >
                   <ActiveToggleHeader activeToggleManu={activeToggleManu} textHeader="Review list display"  activeToggleManuText={"Review_list"} setActiveToggleManu={setActiveToggleManu} />
                

                {activeToggleManu =="Review_list" && (
                       <s-stack gap="small" paddingBlockStart="small" >
                  <s-switch
                    label="Show reviewer name"
                    checked={quickReview.showReviewerName || undefined}
                    onchange={handleSwitch("showReviewerName")}
                  />
                  <s-switch
                    label="Show media thumbnails"
                    checked={quickReview.showMediaImageAndVideo || undefined}
                    onchange={handleSwitch("showMediaImageAndVideo")}
                  />
                  
                  <s-switch
                    label="Show product name on card"
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
                    label="Show star rating on card"
                    checked={quickReview.showRatingFilter || undefined}
                    onchange={handleSwitch("showRatingFilter")}
                  />
                     <s-switch
                    label="Show Helpful button"
                    checked={quickReview.showHelfullButton || undefined}
                    onchange={handleSwitch("showHelfullButton")}
                  />
                      

                  <s-stack border="base" borderRadius="base" padding="small">
                    <s-select
                      label="Review per page"
                      value={quickReview.reviewPerPage}
                      onchange={(e) =>
                        setQuickReview((prev) => ({
                          ...prev,
                          reviewPerPage: Number(e.target.value),
                        }))
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
      setQuickReview((prev) => ({
        ...prev,
        defaultSort: e.target.value,
      }))
    }
  >
    <s-option value="MOST_RECENT">
      Most recent (default)
    </s-option>

    <s-option value="HIGHEST_RATING">
      Highest rating
    </s-option>

    <s-option value="LOWEST_RATING">
      Lowest rating
    </s-option>

    <s-option value="ONLY_PICTURES">
      Only pictures
    </s-option>

    <s-option value="ONLY_VIDEOS">
      Only videos
    </s-option>

    <s-option value="VIDEOS_FIRST">
      Videos first
    </s-option>

        <s-option value="MOST_HELPFUL">
      Most helpful
    </s-option>

  </s-select>
</s-stack>

                    <s-stack border="base" borderRadius="base" padding="small">
                    <s-select
                      label="Filter & sorting"
                      value={quickReview.filterAndSorting}
                      onchange={(e) =>
                        setQuickReview((prev) => ({
                          ...prev,
                          filterAndSorting: e.target.value,
                        }))
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

                </s-stack> 
 
                )}
             

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
            height: "auto",
            overflow: "hidden",
            background: "#fff",
          }}
        >
          {/* Start----Preview Header */}
          <div className="review-item"
            // style={{
            //   height: "76px",
            //   display: "grid",
            //   alignItems: "center",
            //   borderBottom: "1px solid #e4e4e4ff",
            // }}
          >
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
          <QuickReviewComponent
            quickReviewTab={quickReviewTab}
            quickReview={quickReview}
            activeDevice={activeDevice}
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
