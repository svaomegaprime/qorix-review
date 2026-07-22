import { useEffect, useState } from "react"
import Loader from "../../../../../components/essentials/Loader"
import SaveBar from "../../../components/savebar/SaveBar"
import { useSaveBarTrigger } from "../../../components/savebar/useSaveBarTrigger"
import { requestAppWindowClose } from "../../../utils/useAppWindowClose"
import PreviewContent from "../components/PreviewContent"
import Sidebar from "../components/Sidebar"
import { useLoaderData, useNavigation } from "react-router"

// Start----Default selected values
const DEFAULT_COLORS = {
    STAR_COLOR: "#F59E0B",
    TEXT_COLOR: "#1A1A1A",
    VERIFIED_BADGE_COLOR: "#088728"
};

const DEFAULT_TYPOGRAPHY = {
    FONT_SIZE: 16,
    STAR_SIZE: 16,
    FONT_WEIGHT: "MEDIUM"
};

const DEFAULT_CONTENTS = {
    SHOW_AVERAGE_RATING: true,
    SHOW_REVIEW_COUNT: true,
    SHOW_VERIFIED_BADGE: true,
    REVIEW_SOURCE: "DEMO_REVIEW_SOURCE"
}

const DEFAULT_VISIBILITY = {
    HIDE_IF_NO_REVIEWS: true
}
// End----Default selected values

export async function loader () {
    return {typography: DEFAULT_TYPOGRAPHY, colors: DEFAULT_COLORS, contents: DEFAULT_CONTENTS, visibility: DEFAULT_VISIBILITY};
}

export default function Index() {
    // Start----Default CSR loading state checking for navigation
    const navigation = useNavigation();
    const loading = navigation.state === "loading";
    // End----Default CSR loading state checking for navigation

    // Start----Accessing loaded data using useLoaderData
    const loaderData = useLoaderData();
    // End----Accessing loaded data using useLoaderData

    // Start----State for loader selected values
    const [contents, setContents] = useState(loaderData.contents);
    const [colors, setColors] = useState(loaderData.colors);
    const [typography, setTypography] = useState(loaderData.typography);
    const [visibility, setVisibility] = useState(loaderData.visibility);
    const [sidebarResetKey, setSidebarResetKey] = useState(0);
    // End----State for loader selected values

    // Start----State for active device
    const [activeDevice, setActiveDevice] = useState("desktop");
    // End----State for active device

    // Start----Handlers for hide app window
    const handleHideAppWindow = () => {
        requestAppWindowClose("trust_bar");
    };
    // End----Handlers for hide app window

    // Start----Handlers for discard changes
    const handleDiscard = () => {
        setContents(loaderData.contents);
        setColors(loaderData.colors);
        setTypography(loaderData.typography);
        setVisibility(loaderData.visibility);
        setSidebarResetKey((key) => key + 1);
    }
    // End----Handlers for discard changes

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
            handleDiscard();
        },
    });
    // End----Handlers for SaveBar

    // Start----Handlers for reset to defaults
    const handleResetToDefaults = () => {
        saveBar.triggerDiscard();
    }
    // End----Handlers for reset to defaults

    // Start----Handlers for changing styles
    const handleChange = (e) => {
        let nextContents = contents;
        let nextColors = colors;
        let nextTypography = typography;
        let nextVisibility = visibility;

        if(e.target === "contents") {
            nextContents = { ...contents, ...e.value };
            setContents(nextContents);
        }else if(e.target === "colors") {
            nextColors = { ...colors, ...e.value };
            setColors(nextColors);
        }else if(e.target === "typography") {
            nextTypography = { ...typography, ...e.value };
            setTypography(nextTypography);
        }else if(e.target === "visibility") {
            nextVisibility = { ...visibility, ...e.value };
            setVisibility(nextVisibility);
        } else{
            console.clear();
            console.log("Wrong event fired...");
        }


        const nextValues = {
            contents: nextContents,
            colors: nextColors,
            typography: nextTypography,
            visibility: nextVisibility
        };

        const originalValues = {
            contents: loaderData.contents,
            colors: loaderData.colors,
            typography: loaderData.typography,
            visibility: loaderData.visibility
        };

        const hasChanged = JSON.stringify(nextValues) !== JSON.stringify(originalValues);

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
        if(body) body.style.margin = "0";
        const appNav = document.querySelector("s-app-nav");
        if(appNav) appNav.remove();
    }, []);
    // End----Hide app window padding and remove app nav
    
    if (loading) {
        return <Loader />; // Show loader while navigating to this page or when loader is fetching data
    }

    console.clear();
    console.log("SaveBar submit trigger:", {contents, colors, typography, visibility});

    const selectedValues = {typography, colors, contents, visibility};
    
    return (
        <>  
            {/* <s-button onClick={saveBar.triggerChange}>Change one</s-button>
            <s-button onClick={saveBar.triggerChange}>Change two</s-button>
            <s-button onClick={saveBar.triggerSubmit}>Submit trigger</s-button>
            <s-button onClick={saveBar.triggerDiscard}>Discard trigger</s-button> */}
   <style>
        {`
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
                        VALUES={selectedValues}
                        handleChange={handleChange}
                        handleResetToDefaults={handleResetToDefaults}
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
                        <div 
                            className="review-item"
                        >
                            <s-query-container>
                                <s-grid   gridTemplateColumns="@container (inline-size > 600px) 1fr auto, 1fr" gap="small" justifyContent="space-between" paddingInline="base">
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
 
                            </s-query-container>
                        

                        </div>
                        {/* End----Preview Header */}

                        {/* Start----Preview Content */}
                        <PreviewContent VALUES={selectedValues} activeDevice={activeDevice} />
                        {/* End----Preview Content */}
                    </div>
                    {/* End----Content */}
                </s-grid>
            </s-query-container>
        </>
    )
}
