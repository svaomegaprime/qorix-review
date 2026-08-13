import { useEffect, useState } from "react"
import Loader from "../../../../../components/essentials/Loader"
import SaveBar from "../../../components/savebar/SaveBar"
import { useSaveBarTrigger } from "../../../components/savebar/useSaveBarTrigger"
import { requestAppWindowClose } from "../../../utils/useAppWindowClose"
import PreviewContent from "../components/PreviewContent"
import Sidebar from "../components/Sidebar"
import { useLoaderData, useNavigation, useFetcher } from "react-router"
import { authenticate } from "../../../../../shopify.server"
import prisma from "../../../../../db.server"
import { getStoreData } from "../../../../../utils/getStoreData"
import { setAppMetafield } from "../../../../../utils/appMetafields.server"
import { adminErrorResponse } from "../../../../../utils/adminError.server"
import { useAdminFetcherToast } from "../../../../../utils/useAdminFetcherToast"
import { DEFAULT_TRUST_BAR_SETTINGS } from "../data/trastbarDefaultValue.js"
import { getWidgetsInstalledStatus } from "../../../../../services/appEmbed.server";

// Helper function to convert DB row to settings format
const dbRowToSettings = (data) => {
    if (!data) {
        return { ...DEFAULT_TRUST_BAR_SETTINGS };
    }


    return {
        starColor: data.starColor ?? DEFAULT_TRUST_BAR_SETTINGS.starColor,
        textColor: data.textColor ?? DEFAULT_TRUST_BAR_SETTINGS.textColor,
        verifiedBadgeColor: data.verifiedBadgeColor ?? DEFAULT_TRUST_BAR_SETTINGS.verifiedBadgeColor,
        fontSize: data.fontSize ?? DEFAULT_TRUST_BAR_SETTINGS.fontSize,
        starSize: data.starSize ?? DEFAULT_TRUST_BAR_SETTINGS.starSize,
        fontWeight: data.fontWeight ?? DEFAULT_TRUST_BAR_SETTINGS.fontWeight,
        showAverageRating: data.showAverageRating ?? DEFAULT_TRUST_BAR_SETTINGS.showAverageRating,
        showReviewCount: data.showReviewCount ?? DEFAULT_TRUST_BAR_SETTINGS.showReviewCount,
        showVerifiedBadge: data.showVerifiedBadge ?? DEFAULT_TRUST_BAR_SETTINGS.showVerifiedBadge,
        showVerifiedIconOnly: data.showVerifiedIconOnly ?? DEFAULT_TRUST_BAR_SETTINGS.showVerifiedIconOnly,
        reviewSource: data.reviewSource ?? DEFAULT_TRUST_BAR_SETTINGS.reviewSource,
        hideIfNoReviews: data.hideIfNoReviews ?? DEFAULT_TRUST_BAR_SETTINGS.hideIfNoReviews,
        advanceCss: data.advanceCss ?? DEFAULT_TRUST_BAR_SETTINGS.advanceCss,
    };
};

// ---------------------------------------------------------------------------
// Sidebar/PreviewContent expect a NESTED shape with UPPER_SNAKE_CASE keys,
// grouped as { contents, colors, typography, visibility, advanceCss }.
// Our DB/loader data is a FLAT camelCase object. These two helpers convert
// between the two shapes so neither side has to change.
//
// NOTE: This mapping is a best-effort guess based on the runtime error
// (`Contents` component reading `VALUES.contents.SHOW_AVERAGE_RATING`) and
// the field groupings implied by DEFAULT_TRUST_BAR_SETTINGS' comments. If
// Colors/Typography/Visibility throw a similar "Cannot read properties of
// undefined" error, the message will name the exact missing KEY (e.g.
// STAR_COLOR) — send that and this mapping can be corrected in one line.
// ---------------------------------------------------------------------------
const settingsToGroupedValues = (settings) => ({
    contents: {
        SHOW_AVERAGE_RATING: settings.showAverageRating,
        SHOW_REVIEW_COUNT: settings.showReviewCount,
        SHOW_VERIFIED_BADGE: settings.showVerifiedBadge,
        SHOW_VERIFIED_ICON_ONLY: settings.showVerifiedIconOnly,
        REVIEW_SOURCE: settings.reviewSource,
    },
    colors: {
        STAR_COLOR: settings.starColor,
        TEXT_COLOR: settings.textColor,
        VERIFIED_BADGE_COLOR: settings.verifiedBadgeColor,
    },
    typography: {
        FONT_SIZE: settings.fontSize,
        STAR_SIZE: settings.starSize,
        FONT_WEIGHT: settings.fontWeight,
    },
    visibility: {
        HIDE_IF_NO_REVIEWS: settings.hideIfNoReviews,
    },
    advanceCss: settings.advanceCss,
});

// Reverse of the above: takes a partial grouped update coming back from
// Sidebar's onChange (e.g. { target: "colors", value: { STAR_COLOR: "#000" } })
// and merges it into the flat `settings` shape used everywhere else
// (state, SaveBar submit, DB action).
const groupedFieldToFlatKey = {
    contents: {
        SHOW_AVERAGE_RATING: "showAverageRating",
        SHOW_REVIEW_COUNT: "showReviewCount",
        SHOW_VERIFIED_BADGE: "showVerifiedBadge",
        SHOW_VERIFIED_ICON_ONLY: "showVerifiedIconOnly",
        REVIEW_SOURCE: "reviewSource",
    },
    colors: {
        STAR_COLOR: "starColor",
        TEXT_COLOR: "textColor",
        VERIFIED_BADGE_COLOR: "verifiedBadgeColor",
    },
    typography: {
        FONT_SIZE: "fontSize",
        STAR_SIZE: "starSize",
        FONT_WEIGHT: "fontWeight",
    },
    visibility: {
        HIDE_IF_NO_REVIEWS: "hideIfNoReviews",
    },
};

const applyGroupedChangeToFlatSettings = (settings, target, groupValue) => {
    if (target === "advanceCss") {
        return { ...settings, advanceCss: groupValue };
    }
    const keyMap = groupedFieldToFlatKey[target];
    if (!keyMap) return settings; // unknown group, no-op

    const patch = {};
    Object.entries(groupValue || {}).forEach(([upperKey, val]) => {
        const flatKey = keyMap[upperKey];
        if (flatKey) patch[flatKey] = val;
    });
    return { ...settings, ...patch };
};

// Helper function to ensure proper type conversions for DB
const settingsToDbFields = (settings) => {
    return {
        starColor: String(settings.starColor ?? DEFAULT_TRUST_BAR_SETTINGS.starColor),
        textColor: String(settings.textColor ?? DEFAULT_TRUST_BAR_SETTINGS.textColor),
        verifiedBadgeColor: String(settings.verifiedBadgeColor ?? DEFAULT_TRUST_BAR_SETTINGS.verifiedBadgeColor),
        fontSize: Number(settings.fontSize ?? DEFAULT_TRUST_BAR_SETTINGS.fontSize),
        starSize: Number(settings.starSize ?? DEFAULT_TRUST_BAR_SETTINGS.starSize),
        fontWeight: String(settings.fontWeight ?? DEFAULT_TRUST_BAR_SETTINGS.fontWeight),
        showAverageRating: Boolean(settings.showAverageRating ?? DEFAULT_TRUST_BAR_SETTINGS.showAverageRating),
        showReviewCount: Boolean(settings.showReviewCount ?? DEFAULT_TRUST_BAR_SETTINGS.showReviewCount),
        showVerifiedBadge: Boolean(settings.showVerifiedBadge ?? DEFAULT_TRUST_BAR_SETTINGS.showVerifiedBadge),
        showVerifiedIconOnly: Boolean(settings.showVerifiedIconOnly ?? DEFAULT_TRUST_BAR_SETTINGS.showVerifiedIconOnly),
        reviewSource: String(settings.reviewSource ?? DEFAULT_TRUST_BAR_SETTINGS.reviewSource),
        hideIfNoReviews: Boolean(settings.hideIfNoReviews ?? DEFAULT_TRUST_BAR_SETTINGS.hideIfNoReviews),
        advanceCss: String(settings.advanceCss ?? DEFAULT_TRUST_BAR_SETTINGS.advanceCss),
    };
};

export async function loader({ request }) {
    try {
        const { admin, session } = await authenticate.admin(request);
        const { id } = await getStoreData(admin);

        const res = await prisma.trustBarWidget.findUnique({
            where: {
                storeId: id,
            },
        });

        const settings = dbRowToSettings(res);
        const installedWidgetIds = await getWidgetsInstalledStatus(admin);
        settings.isInstalled = installedWidgetIds.includes("trust_bar");
        settings.shop = session?.shop;

        const response = await admin.graphql(
            `#graphql
            query {
                products(first: 1) {
                    edges {
                        node {
                            handle
                        }
                    }
                }
            }`
        );
        const data = await response.json();
        settings.productHandle = data.data?.products?.edges?.[0]?.node?.handle;

        return settings;
    } catch (error) {
        console.error("[LOADER] ERROR:", error);
        return adminErrorResponse(error);
    }
}

export async function action({ request }) {
    try {
        const { admin } = await authenticate.admin(request);

        const data = await request.json();
        const { id } = await getStoreData(admin);

        console.log("[Trust Bar Action] Received data:", data);
        console.log("[Trust Bar Action] Store ID:", id);

        const dbFields = settingsToDbFields(data);
        console.log("[Trust Bar Action] Converted DB fields:", dbFields);

        const res = await prisma.trustBarWidget.upsert({
            where: {
                storeId: id,
            },
            update: dbFields,
            create: {
                storeId: id,
                ...dbFields,
            },
        });

        console.log("[Trust Bar Action] Upsert result:", res);

        const settingsForMetafield = dbRowToSettings(res);
        // Bug fix: metafieldResult was referenced in the return object below without
        // ever being defined (this line was commented out). That caused a
        // ReferenceError on every save. Uncomment once setAppMetafield is ready to use:
        const metafieldResult = await setAppMetafield(admin, "trust_bar", settingsForMetafield);

        return {
            ok: true,
            widget: res,
            metafieldResult,
        };
    } catch (error) {
        console.error("[ACTION] ERROR:", error);
        console.error("[ACTION] ERROR Details:", error?.message, error?.code);
        return adminErrorResponse(error);
    }
}

export default function Index() {
    // Start----Default CSR loading state checking for navigation
    const navigation = useNavigation();
    const loading = navigation.state === "loading";
    // End----Default CSR loading state checking for navigation

    // Start----Accessing loaded data using useLoaderData
    const loaderData = useLoaderData();

    // Handle loader errors
    if (loaderData?.status && loaderData?.status !== 200) {
        console.error("Loader error:", loaderData);
        return <div>Error loading data. Please try again.</div>;
    }
    // End----Accessing loaded data using useLoaderData

    // Start----State for loader selected values
    const [settings, setSettings] = useState(loaderData || DEFAULT_TRUST_BAR_SETTINGS);
    const [sidebarResetKey, setSidebarResetKey] = useState(0);
    // End----State for loader selected values

    // Start----State for active device
    const [activeDevice, setActiveDevice] = useState("desktop");
    // End----State for active device

    // Start----Fetcher for submitting data to action
    const fetcher = useFetcher();
    useAdminFetcherToast(fetcher);
    // End----Fetcher for submitting data to action

    // Start----Handlers for hide app window
    const handleHideAppWindow = () => {
        requestAppWindowClose("trust_bar");
    };
    // End----Handlers for hide app window

    // Start----Handlers for discard changes
    const handleDiscard = () => {
        setSettings(loaderData || DEFAULT_TRUST_BAR_SETTINGS);
        setSidebarResetKey((key) => key + 1);
    }
    // End----Handlers for discard changes

    // Start----Handlers for SaveBar
    const saveBar = useSaveBarTrigger({
        onSubmit: () => {
            console.log("[SaveBar] Submitting settings:", settings);
            fetcher.submit(settings, {
                method: "post",
                encType: "application/json",
            });
        },
        onDiscard: () => {
            handleDiscard();
        },
    });
    // End----Handlers for SaveBar

    // Start----Handlers for reset to defaults
    const handleResetToDefaults = () => {
        setSettings(DEFAULT_TRUST_BAR_SETTINGS);
        setSidebarResetKey((key) => key + 1);
        saveBar.triggerChange();
    }
    // End----Handlers for reset to defaults

    // Start----Single setting field change (e.g. starColor, fontSize, showVerifiedBadge...)
    const handleSettingChange = (fieldName, value) => {
        const nextSettings = {
            ...settings,
            [fieldName]: value,
        };
        setSettings(nextSettings);

        const original = loaderData || DEFAULT_TRUST_BAR_SETTINGS;
        const hasChanged = JSON.stringify(nextSettings) !== JSON.stringify(original);

        if (hasChanged) {
            saveBar.triggerChange();
        } else {
            saveBar.triggerDiscard({ silent: true });
        }
    };
    // End----Single setting field change

    // Start----Handler for multiple fields at once (e.g. a group like colors: {STAR_COLOR, TEXT_COLOR})
    const handleChange = (e) => {
        // e = { target: "colors" | "typography" | "contents" | "visibility" | "advanceCss", value: {...} }
        const nextSettings = applyGroupedChangeToFlatSettings(settings, e.target, e.value);
        setSettings(nextSettings);

        const original = loaderData || DEFAULT_TRUST_BAR_SETTINGS;
        const hasChanged = JSON.stringify(nextSettings) !== JSON.stringify(original);

        if (hasChanged) {
            saveBar.triggerChange();
        } else {
            saveBar.triggerDiscard({ silent: true });
        }
    }
    // End----Handlers for changing styles

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

    // Grouped/nested VALUES for Sidebar's child components (Contents, Colors, Typography, Visibility)
    const groupedValues = settingsToGroupedValues(settings);

    // customCss / handleCssChange: Sidebar expects these as separate props
    // (advanceCss lives flat on `settings`, mapped to/from the grouped shape above)
    const customCss = settings.advanceCss;
    const handleCssChange = (nextCss) => {
        handleSettingChange("advanceCss", nextCss);
    };

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
                    scrollbar-width: none;
                    -ms-overflow-style: none;
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
            <s-query-container> {/* @container (inline-size < 590px) 1fr, 5fr 7fr */}
                <s-grid gridTemplateColumns="@container (inline-size > 900px) 346px 1fr, 1fr" alignItems="start">
                    {/* Start----Sidebar */}
                    <Sidebar
                        key={sidebarResetKey}
                        handleHideAppWindow={handleHideAppWindow}
                        VALUES={groupedValues}
                        onSettingChange={handleSettingChange}
                        handleChange={handleChange}
                        handleResetToDefaults={handleResetToDefaults}
                        customCss={customCss}
                        handleCssChange={handleCssChange}
                        isInstalled={loaderData?.isInstalled}
                    />
                    {/* End----Sidebar */}

                    {/* Start----Content */}
                    <div
                        style={{
                            height: "100vh",
                            overflow: "hidden",
                            background: "#fff",
                            minWidth: 0
                        }}
                    >
                        {/* Start----Preview Header */}
                        <div className="review-item">
                            <s-query-container>
                                <s-grid gridTemplateColumns="@container (inline-size > 600px) 1fr auto, 1fr" gap="small" justifyContent="space-between" paddingInline="base">
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
                                       <s-button slot="secondary-actions" href="http://qorix-review-docs.nextvence.com/pages/widgets/trustbar" target="_blank">Need help?</s-button>
                                        <s-button variant="primary" slot="primary-action" onClick={() => {
                                            if (loaderData?.shop) {
                                                const url = loaderData.productHandle
                                                    ? `https://${loaderData.shop}/products/${loaderData.productHandle}`
                                                    : `https://${loaderData.shop}`;
                                                window.open(url, "_blank");
                                            }
                                        }}>
                                            <div style={{
                                                display: "flex",
                                                alignItems: "center",
                                            }}>
                                                Preview on store <s-icon type="arrow-up-right" />
                                            </div>
                                        </s-button>
                                    </s-button-group>
                                </s-grid>
                            </s-query-container>
                        </div>
                        {/* End----Preview Header */}

                        {/* Start----Preview Content */}
                        <PreviewContent VALUES={groupedValues} activeDevice={activeDevice} />
                        {/* End----Preview Content */}
                    </div>
                    {/* End----Content */}
                </s-grid>
            </s-query-container>
        </>
    )
}
