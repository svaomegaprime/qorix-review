import { useState, useEffect } from "react";
import Text from "../../../components/essentials/elements/Text";
import Loader from "../../../components/essentials/Loader";
import TabButton from "../../../components/essentials/TabButton";
import CustomSection from "../../../components/essentials/CustomSection";
import WidgetItem from "../components/WidgetItem";
import { useLoaderData, useNavigation, useRevalidator } from "react-router";
import { getWidgetsInstalledStatus } from "../../../services/appEmbed.server.js";
import { requireAdminContext } from "../../../services/adminContext.server.js";

export async function loader({ request }) {
  try {
    const { admin, session } = await requireAdminContext(request);
    const installedWidgetIds = await getWidgetsInstalledStatus(admin);
    return {
      shop: session?.shop || "",
      // eslint-disable-next-line no-undef
      apiKey: process.env.SHOPIFY_API_KEY || "1fd61c4448a3e740e2e1b9bc99b9db0d",
      installedWidgetIds,
    };
  } catch {
    return {
      shop: "",
      apiKey: "1fd61c4448a3e740e2e1b9bc99b9db0d",
      installedWidgetIds: [],
    };
  }
}

const TAB_CONFIG = [
  {
    key: "all",
    label: "All widgets",
  },
  {
    key: "installed",
    label: "Installed",
  },
  {
    key: "product-page",
    label: "Product page",
  },
  {
    key: "review-form",
    label: "Review form",
  },
];

const WIDGETS = [
  {
    id: "quick_review",
    name: "QuickReview",
    description:
      "A pre-installed, one-click widget that lets customers write a review instantly — no account required. Increases review collection by 40%+.",
    previewUrl: "/widgets/quick-review.png",
    editUrl: "/app/widgets/quick-review",
    types: ["floating", "review-form","product-page"],
  },
  {
    id: "trust_bar",
    name: "TrustBar",
    description:
      "A clean badge displaying a product’s average star rating and total review count. Boosts credibility instantly — perfect above the fold or next to pricing.",
    previewUrl: "/widgets/trust-bar.png",
    editUrl: "/app/widgets/trust-bar",
    types: ["product-page", "standalone-page"],
  },
  {
    id: "review_reel",
    name: "ReviewReel",
    description:
      "An interactive carousel that turns your best video, image, and text reviews into moving stories. Shoppers can swipe, click, and play — no page reload.",
    previewUrl: "/widgets/review-reel.png",
    editUrl: "/app/widgets/review-reel",
    types: [ "standalone-page"],
  },
  {
    id: "video_stack",
    name: "VidioStack",
    description:
      "A sleek, rotating slider for your most impactful video reviews. Lets shoppers see your products in action without leaving the product page.",
    previewUrl: "/widgets/video-stack.png",
    editUrl: "/app/widgets/video-stack",
    types: [ "standalone-page"],
  },
  {
    id: "quote_loop",
    name: "QuoteLoop",
    description:
      "A bold, eye-catching carousel to highlight winning quotes from your best reviews. Auto-rotates or manual.",
    previewUrl: "/widgets/quote-loop.png",
    editUrl: "/app/widgets/quote-loop",
    types: [ "standalone-page"],
  },
  {
    id: "review_hub",
    name: "ReviewHub",
    description:
      "Collect and display product reviews directly on your product pages. Full control over layout, sorting, and filters.",
    previewUrl: "/widgets/review-hub.png",
    editUrl: "/app/widgets/review-hub",
    types: [ "standalone-page"],
  },
];

export default function Widegets() {
  const {
    shop = "",
    apiKey = "",
    installedWidgetIds = [],
  } = useLoaderData() || {};
  const revalidator = useRevalidator();

  useEffect(() => {
    const handleFocus = () => {
      if (revalidator.state === "idle") {
        revalidator.revalidate();
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [revalidator]);

  // Start----Default CSR loading state checking for navigation
  const navigation = useNavigation();
  const loading = navigation.state === "loading";
  // End----Default CSR loading state checking for navigation

  // Start----State for active tab
  const [activeTab, setActiveTab] = useState("all");

  // Start----Tab click handler
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const getFilteredWidgets = () => {
    if (activeTab === "all") {
      return WIDGETS;
    } else if (activeTab === "installed") {
      return WIDGETS.filter((widget) => installedWidgetIds.includes(widget.id));
    } else {
      return WIDGETS.filter((widget) => widget.types.includes(activeTab));
    }
  };

  const filteredWidgets = getFilteredWidgets();

  if (loading) {
    return <Loader />;
  }

  return (
    <s-page inlineSize="large">
      <div
        style={{
          maxWidth: "1200px",
          marginInline: "auto",
        }}
      >
        {/* Start----Page Header */}
        <s-grid
          gridTemplateColumns="auto auto"
          alignItems="center"
          justifyContent="space-between"
          gap="base"
          paddingBlock="small large"
        >
          <s-stack direction="inline" alignItems="center" gap="small">
            <Text as="h2">Widgets</Text>
          </s-stack>
        </s-grid>
        {/* End----Page Header */}

        {/* Start----Page main filter tabs */}
        <s-stack paddingBlock="small base">
          <s-section>
            <s-grid
              gridTemplateColumns="repeat(auto-fit, minmax(100px, 1fr))"
              gap="base"
            >
              {TAB_CONFIG.map((tab) => (
                <TabButton
                  key={tab.key}
                  isActive={activeTab === tab.key}
                  onClick={() => handleTabClick(tab.key)}
                >
                  {tab.label}
                </TabButton>
              ))}
            </s-grid>
          </s-section>
        </s-stack>
        {/* End----Page main filter tabs */}

        {/* Start----Page main content */}
        <s-section>
          <CustomSection background="#F0F0F0" border="none" boxShadow="none">
            <s-query-container>
              <s-grid
                gridTemplateColumns="@container (inline-size > 600px) 'repeat(3, 1fr)', 1fr"
                gap="large-200 base"
              >
                {filteredWidgets.map((widget, index) => {
                  const isInstalled = installedWidgetIds.includes(widget.id);
                  return (
                    <WidgetItem
                      key={index}
                      widget={widget}
                      status={isInstalled ? "INSTALLED" : "NOT_INSTALLED"}
                      shop={shop}
                      apiKey={apiKey}
                    />
                  );
                })}
              </s-grid>
            </s-query-container>
          </CustomSection>
        </s-section>
      </div>
    </s-page>
  );
}
