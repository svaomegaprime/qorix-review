import { useEffect, useState } from "react"
import Loader from "../../../../../components/essentials/Loader"
import CustomSection from "../../../../../components/essentials/CustomSection"
import Text from "../../../../../components/essentials/elements/Text"
import SaveBar from "../../../components/savebar/SaveBar"
import { useSaveBarTrigger } from "../../../components/savebar/useSaveBarTrigger"
import { requestAppWindowClose } from "../../../utils/useAppWindowClose"
import { useNavigation } from "react-router"

export default function Index() {
    // Start----Default CSR loading state checking for navigation
    const navigation = useNavigation();
    const loading = navigation.state === "loading";
    // End----Default CSR loading state checking for navigation

    const [activeDevice, setActiveDevice] = useState("desktop");

    // Start----Handlers for hide app window
    const handleHideAppWindow = () => {
        requestAppWindowClose("video_stack");
    };
    // End----Handlers for hide app window

    // Start----Handlers for SaveBar
    const saveBar = useSaveBarTrigger({
        onSubmit: (formData) => {
            console.log("SaveBar submit trigger:", formData);
            setTimeout(() => {
                requestAppWindowClose("video_stack");
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
                                <Text as="h3">VidoeStack</Text>
                                <s-badge tone="caution">Not installed</s-badge>
                            </s-stack>
                            <s-paragraph color="subdued">
                                Showcase your videos in a beautiful slide show
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
                    {/* End----Preview Content */}
                </div>
                {/* End----Content */}
            </s-grid>
        </>
    )
}
