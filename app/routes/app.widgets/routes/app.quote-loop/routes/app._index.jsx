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
    label: "Quote mark and badge color",
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

const createDefaultSettings = () => ({
  // Header option
  showHeader: true,
  headerStyle: "center",
  eyebrowLabel: "CUSTOMER REVIEWS",
  heading: "Reviews from people",
  subheading: "Watch and hear what our customers have to say.",
  reviewStats: "Show review count & verified badge",

  // Display elements and loop behavior
  showStarDistribution: true,
  showReviewerName: true,
  showQuoteMarkIcon: true,
  showVerifiedBadge: true,
  showMediaAsset: true,
  showArrowControls: true,
  showProductName: true,
  autoSlider: false,
  showAppreciationOption: true,
  speed: 450,

  filterSorting: "Filter & sorting both",
  fiteringMinStart: "3 star and above",

  // color picker
  colors: { ...DEFAULT_COLOR_VALUES },

  // Typography
  quoteFontSize: 24,
  textLength: 160,
  advanceCss: "",
});

const cloneSettings = (settings) => JSON.parse(JSON.stringify(settings));

export async function loader({ request }) {
  try {
    const { admin } = await authenticate.admin(request);
    const { id } = await getStoreData(admin);

    console.log("[LOADER] storeId used for lookup:", id); // DEBUG

    const res = await prisma.quoteLoopWidget.findUnique({
      where: {
        storeId: id,
      },
    });

    console.log("[LOADER] found record:", res); // DEBUG

    return res?.settings ?? createDefaultSettings();
  } catch (error) {
    console.error("[LOADER] ERROR:", error); // DEBUG
    return adminErrorResponse(error);
  }
}

export async function action({ request }) {
  try {
    const { admin } = await authenticate.admin(request);
    console.log("[ACTION] Auth OK"); // DEBUG

    const data = await request.json();
    console.log("[ACTION] Received data:", JSON.stringify(data, null, 2)); // DEBUG

    const { id } = await getStoreData(admin);
    console.log("[ACTION] storeId (connect target):", id); // DEBUG

    const res = await prisma.quoteLoopWidget.upsert({
      where: {
        storeId: id,
      },
      update: {
        settings: data,
      },
      create: {
        settings: data,
        store: {
          connect: {
            storeGID: id,
          },
        },
      },
    });

    console.log("[ACTION] Upsert success:", res); // DEBUG

    return {
      ok: true,
      widget: res,
    };
  } catch (error) {
    console.error("[ACTION] ERROR NAME:", error?.name); // DEBUG
    console.error("[ACTION] ERROR MESSAGE:", error?.message); // DEBUG
    console.error("[ACTION] ERROR FULL:", error); // DEBUG
    return adminErrorResponse(error);
  }
}

export default function Index(VALUES = {}) {
  // Start----Default CSR loading state checking for navigation
  const navigation = useNavigation();
  const loading = navigation.state === "loading";
  // End----Default CSR loading state checking for navigation

  const loaderData = useLoaderData();
  console.log("[CLIENT] loaderData:", loaderData); // DEBUG

  const [activeDevice, setActiveDevice] = useState("desktop");

  const [settings, setSettings] = useState(() => cloneSettings(loaderData || createDefaultSettings()));
  const [customCss, setCss] = useState(() => loaderData?.advanceCss ?? createDefaultSettings().advanceCss ?? "");

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

  const postData = () => {
    const data = { ...settings };
    console.log("[CLIENT] postData raw:", data); // DEBUG
    try {
      console.log("[CLIENT] postData JSON stringify check:", JSON.stringify(data)); // DEBUG
    } catch (err) {
      console.error("[CLIENT] postData JSON stringify FAILED:", err); // DEBUG
    }
    return data;
  };

  const fetcher = useFetcher();
  useAdminFetcherToast(fetcher);
  const initSettingsRef = useRef(null);
  const savePendingRef = useRef(false);

  if (initSettingsRef.current === null) {
    initSettingsRef.current = cloneSettings(settings);
  }

  const handleSubmit = () => {
    savePendingRef.current = true;
    const data = postData();
    console.log("[CLIENT] Submitting via fetcher.submit:", data); // DEBUG
    fetcher.submit(data, {
      method: "post",
      encType: "application/json",
    });
  };

  // DEBUG: track fetcher state/response
  useEffect(() => {
    console.log("[CLIENT] fetcher.state:", fetcher.state); // DEBUG
    console.log("[CLIENT] fetcher.data:", fetcher.data); // DEBUG
  }, [fetcher.state, fetcher.data]);

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

      <SaveBar saveBar={saveBar} />
      <s-query-container>
      <s-grid gridTemplateColumns="@container (inline-size > 900px) 346px 1fr, 1fr" alignItems="start">
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
                      handleSettingChange("showArrowControls", e.target.checked)
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
                      handleSettingChange("textLength", Number(e.target.value))
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
                <ResetToDefaults handleResetToDefaults={handleResetToDefaults} />
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
              <s-stack alignItems="center" justifyContent="center" gap="small">
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