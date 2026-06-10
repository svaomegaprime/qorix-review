import { useEffect, useState } from "react"
import Loader from "../../../../../components/essentials/Loader"
import CustomSection from "../../../../../components/essentials/CustomSection"
import Text from "../../../../../components/essentials/elements/Text"
import SaveBar from "../../../components/savebar/SaveBar"
import { useSaveBarTrigger } from "../../../components/savebar/useSaveBarTrigger"
import { requestAppWindowClose } from "../../../utils/useAppWindowClose"
import ColorPicker from "../../../components/elements/ColorPicker"
import Range from "../../../components/elements/Range"
import PreviewContent from "../components/PreviewContent"
import { useNavigation } from "react-router"

// Start----Elements for sidebar
const COLOR_PICKERS = [
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
    }
];

const TYPOGRAPHY = [
    {
        key: "FONT_SIZE",
        value: 16
    },
    {
        key: "STAR_SIZE",
        value: 16
    },
    {
        key: "FONT_WEIGHT",
        values: [
            {
                label: "Light",
                value: "LIGHT"
            },
            {
                label: "Medium",
                value: "MEDIUM"
            },
            {
                label: "Bold",
                value: "BOLD"
            }
        ]
    }
];
// End----Elements for sidebar

// Start----Default selected values
const SELECTED_COLORS = {
    STAR_COLOR: "#F59E0B",
    TEXT_COLOR: "#1A1A1A",
    VERIFIED_BADGE_COLOR: "#088728"
};

const SELECTED_TYPOGRAPHY = {
    FONT_SIZE: 16,
    STAR_SIZE: 16,
    FONT_WEIGHT: "MEDIUM"
};
// End----Default selected values

export default function Index() {
    // Start----Default CSR loading state checking for navigation
    const navigation = useNavigation();
    const loading = navigation.state === "loading";
    // End----Default CSR loading state checking for navigation

    const [activeDevice, setActiveDevice] = useState("desktop");

    // Start----Handlers for hide app window
    const handleHideAppWindow = () => {
        requestAppWindowClose("trust_bar");
    };
    // End----Handlers for hide app window

    // Start----Handlers for SaveBar
    const saveBar = useSaveBarTrigger({
        onSubmit: (formData) => {
            console.log("SaveBar submit trigger:", formData);
            setTimeout(() => {
                requestAppWindowClose("trust_bar");
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
                                <Text as="h3">TrustBar</Text>
                                <s-badge tone="success">Installed</s-badge>
                            </s-stack>
                            <s-paragraph color="subdued">
                                Shows average rating + review count.
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
                        <s-grid gap="base" padding="base">
                            {/* Start----Contents section */}
                            <CustomSection>
                                <s-heading>Contents</s-heading>
                                <s-stack paddingBlock="small">
                                    <s-switch label="Show average rating" />
                                    <s-switch label="Show review count" />
                                    <s-switch label="Show verified badge" />
                                </s-stack>
                                <CustomSection padding="small base base base">
                                    <s-select label="Review source">
                                        <s-option value="DEMO_REVIEW_SOURCE">Qorix demo reviews</s-option>
                                        <s-option value="REAL_REVIEW_SOURCE">Store real reviews</s-option>
                                    </s-select>
                                </CustomSection>
                            </CustomSection>
                            {/* End----Contents section */}

                            {/* Start----Colors section */}
                            <CustomSection>
                                <s-grid gap="base">
                                    <s-heading>Colors</s-heading>
                                    {COLOR_PICKERS.map((picker) => (
                                        <ColorPicker key={picker.key} data={picker} defaultColor={SELECTED_COLORS[picker.key]} />
                                    ))}
                                </s-grid>
                            </CustomSection>
                            {/* End----Colors section */}

                            {/* Start----Typography section */}
                            <CustomSection>
                                <s-grid gap="base">
                                    <s-heading>Typography</s-heading>
                                    <CustomSection padding="small">
                                        <Range label="Font size" defaultValue={SELECTED_TYPOGRAPHY["FONT_SIZE"]} max={50} />
                                    </CustomSection>
                                    <CustomSection padding="small">
                                        <Range label="Star size" defaultValue={SELECTED_TYPOGRAPHY["STAR_SIZE"]} max={50} />
                                    </CustomSection>
                                    <CustomSection padding="small">
                                        <s-select label="Font weight" defaultValue={SELECTED_TYPOGRAPHY["FONT_WEIGHT"]}>
                                            {TYPOGRAPHY.find((item) => item.key === "FONT_WEIGHT")?.values.map((value, key) => (
                                                <s-option key={key} value={value?.value} defaultSelected={value?.value === SELECTED_TYPOGRAPHY["FONT_WEIGHT"]}>{value?.label}</s-option>
                                            ))}
                                        </s-select>
                                    </CustomSection>
                                </s-grid>
                            </CustomSection>
                            {/* End----Typography section */}

                            {/* Start----Visibility section */}
                            <CustomSection padding="small base">
                                <s-heading>Visibility</s-heading>
                                <s-switch label="Hide if no reviews" defaultChecked />
                            </CustomSection>
                            {/* End----Visibility section */}

                            <s-stack alignItems="center" padding="base">
                                <s-button icon="reset" commandFor="reset_confirmation" command="--show">Reset to defaults</s-button>
                                <s-popover id="reset_confirmation">
                                    <s-stack padding="base" gap="small" maxInlineSize="180px">
                                        <s-heading>Are you sure you want to reset to defaults?</s-heading>
                                        <s-grid gridTemplateColumns="auto auto" gap="base" alignItems="center" justifyContent="end">
                                            <s-button commandFor="reset_confirmation" command="--hide">Cancel</s-button>
                                            <s-button variant="primary" tone="critical">Reset</s-button>
                                        </s-grid>
                                    </s-stack>
                                </s-popover>
                            </s-stack>
                        </s-grid>
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

                    {/* Start----Preview Content */}
                    <PreviewContent />
                    {/* End----Preview Content */}
                </div>
                {/* End----Content */}
            </s-grid>
        </>
    )
}
