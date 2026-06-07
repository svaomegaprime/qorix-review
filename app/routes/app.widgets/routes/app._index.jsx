import { useState } from "react";
import Text from "../../../components/essentials/elements/Text";
import Loader from "../../../components/essentials/Loader";
import TabButton from "../../../components/essentials/TabButton";
import CustomSection from "../../../components/essentials/CustomSection";
import WidgetItem from "../components/WidgetItem";
import { useNavigation } from "react-router";

const TAB_CONFIG = [
    {
        key: "all",
        label: "All widgets"
    },
    {
        key: "installed",
        label: "Installed"
    },
    {
        key: "product-page",
        label: "Product page"
    },
    {
        key: "standalone-page",
        label: "Standalone page"
    },
    {
        key: "floating",
        label: "Floating"
    },
    {
        key: "review-form",
        label: "Review form"
    }
];

const WIDGETS = [
    {
        id: "trust_bar",
        name: "TrustBar",
        description: "A clean badge displaying a product’s average star rating and total review count. Boosts credibility instantly — perfect above the fold or next to pricing.",
        previewUrl: "/widgets/trust-bar.png",
        editUrl: "/app/preview",
        types: ["product-page", "standalone-page"]
    },
    {
        id: "review_reel",
        name: "ReviewReel",
        description: "An interactive carousel that turns your best video, image, and text reviews into moving stories. Shoppers can swipe, click, and play — no page reload.",
        previewUrl: "/widgets/review-reel.png",
        editUrl: "/app/preview",
        types: ["product-page", "standalone-page"]
    },
    {
        id: "vidio_stack",
        name: "VidioStack",
        description: "A sleek, rotating slider for your most impactful video reviews. Lets shoppers see your products in action without leaving the product page.",
        previewUrl: "/widgets/video-stack.png",
        editUrl: "/app/preview",
        types: ["product-page", "standalone-page"]
    },
    {
        id: "quote_loop",
        name: "QuoteLoop",
        description: "A bold, eye-catching carousel to highlight winning quotes from your best reviews. Auto-rotates or manual.",
        previewUrl: "/widgets/quote-loop.png",
        editUrl: "/app/preview",
        types: ["product-page", "standalone-page"]
    },
    {
        id: "review_hub",
        name: "ReviewHub",
        description: "Collect and display product reviews directly on your product pages. Full control over layout, sorting, and filters.",
        previewUrl: "/widgets/review-hub.png",
        editUrl: "/app/preview",
        types: ["product-page", "standalone-page"]
    },
    {
        id: "quick_review",
        name: "QuickReview",
        description: "A pre-installed, one-click widget that lets customers write a review instantly — no account required. Increases review collection by 40%+.",
        previewUrl: "/widgets/quick-review.png",
        editUrl: "/app/preview",
        types: ["floating", "review-form"]
    }
];

const INSTALLED_WIDGETS = [
    "trust_bar",
    "review_reel"
];

export default function Widegets() {
    // Start----Default CSR loading state checking for navigation
    const navigation = useNavigation();
    const loading = navigation.state === "loading";
    // End----Default CSR loading state checking for navigation

    // Start----State for active tab
    const [activeTab, setActiveTab] = useState("all");
    // End----State for active tab

    // Start----State for filtered widgets
    const [filteredWidgets, setFilteredWidgets] = useState(WIDGETS);
    // End----State for filtered widgets

    // Start----Tab click handler
    const handleTabClick = (tab) => {
        setActiveTab(tab);
        if (tab === "all") {
            setFilteredWidgets(WIDGETS);
        } else if(tab === "installed") {
            const filtered = WIDGETS.filter((widget) => INSTALLED_WIDGETS.includes(widget.id));
            setFilteredWidgets(filtered);
        } else {
            const filtered = WIDGETS.filter((widget) => widget.types.includes(tab));
            setFilteredWidgets(filtered);
        }
    };
    // End----Tab click handler

    if (loading) {
        return <Loader />; // Show loader while navigating to this page or when loader is fetching data
    }
    return (
        <s-page>
            {/* Start----Page Header */}
            <s-grid gridTemplateColumns="auto auto" alignItems="center" justifyContent="space-between" gap="base" paddingBlock="small large">
                <s-stack direction="inline" alignItems="center" gap="small">
                    <Text as="h2">Requests</Text>
                    <s-badge tone="success" color="strong">Auto-send: On</s-badge>
                </s-stack>
                {/* <s-button icon="settings">Request reviews</s-button> */}
                <s-select>
                    <s-option>test-data (live)</s-option>
                    <s-option>real-data (live)</s-option>
                </s-select>
            </s-grid>
            {/* End----Page Header */}

            {/* Start----Page main filter tabs */}
            <s-stack paddingBlock="small base">
                <s-section>
                    <s-grid gridTemplateColumns="repeat(auto-fit, minmax(100px, 1fr))" gap="base">
                        {TAB_CONFIG.map((tab) => (
                            <TabButton
                                key={tab.key}
                                isActive={activeTab === tab.key}
                                onClick={() => handleTabClick(tab.key)}
                            >
                                {tab.label}
                                {/* <s-badge tone={tab.tone} color="strong">
                                    {tab.statuses
                                        ? requests.filter((request) => tab.statuses.includes(request.status)).length
                                        : requests.length}
                                </s-badge> */}
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
                        <s-grid gridTemplateColumns="@container (inline-size > 600px) 'repeat(3, 1fr)', 1fr" gap="large-200 base">
                            {filteredWidgets.map((widget, index) => (
                                <WidgetItem key={index} widget={widget} status={INSTALLED_WIDGETS.includes(widget.id) ? "INSTALLED" : "NOT_INSTALLED"} />
                            ))}
                        </s-grid>
                    </s-query-container>
                </CustomSection>
            </s-section>
        </s-page>
    )
}