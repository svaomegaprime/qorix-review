/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useState } from "react";
import ProgressiveBar from "./elements/ProgressiveBar";
import SetupGuideItem from "./elements/SetupGuideItem";
import { useRevalidator } from "react-router";
import { getAppEmbedDeepLink, openThemeEditor } from "../../../utils/themeEditorLinks";

const DEFAULT_ACTIVE_ITEM = "item1";

export default function SetupGuide({ handleUpdate, shop = "", apiKey = "", isAppEnabled = false }) {
    const [isActivated, setIsActivated] = useState(DEFAULT_ACTIVE_ITEM);
    const [step2Completed, setStep2Completed] = useState(false);
    const [step3Completed, setStep3Completed] = useState(false);
    const revalidator = useRevalidator();
    const isVerifying = revalidator.state === "loading";

    const handleToggle = (item) => {
        setIsActivated(item);
    };

    const handleEnableAppEmbedClick = () => {
        const url = getAppEmbedDeepLink({ shop, apiKey, embedHandle: "app_embed" });
        openThemeEditor(url);
    };

    const handleVerifyInstallation = () => {
        revalidator.revalidate();
    };

    const completedSteps = (isAppEnabled ? 1 : 0) + (step2Completed ? 1 : 0) + (step3Completed ? 1 : 0);
    
    return (
        <s-section>
            <s-stack gap="base">
                <ProgressiveBar step={completedSteps} totalSteps={3} />
                {/* Step 1 - Enable app embed - Start */}
                <SetupGuideItem
                    title="Install review widget and rating badge"
                    description="Enable the Qorix Reviews block in your theme editor to display reviews and star ratings on your product pages."
                    isActivated={isActivated === "item1"}
                    onToggle={() => handleToggle("item1")}
                    isCompleted={isAppEnabled}
                >
                    <s-grid gridTemplateColumns='auto auto' gap='small' justifyContent='start'>
                        <s-button
                            variant={isAppEnabled ? "secondary" : "primary"}
                            icon="external"
                            onClick={handleEnableAppEmbedClick}
                        >
                            {isAppEnabled ? "App Embed Enabled 🟢" : "Enable app embed"}
                        </s-button>
                        <s-button
                            variant="secondary"
                            loading={isVerifying}
                            onClick={handleVerifyInstallation}
                        >
                            {isAppEnabled ? "Verified ✓" : "Verify Installation"}
                        </s-button>
                    </s-grid>
                </SetupGuideItem>
                {/* Step 1 - Enable app embed - End */}
                {/* Step 2 - Customize widget - Start */}
                <SetupGuideItem
                    title="Customize the review widget"
                    description="Match the widget to your store's look"
                    isActivated={isActivated === "item2"}
                    onToggle={() => handleToggle("item2")}
                    isCompleted={step2Completed}
                >
                    <s-grid gridTemplateColumns='auto auto' gap='small' justifyContent='start'>
                        <s-button variant='primary' icon='external' href="/app/widgets">Go to widget settings</s-button>
                        <s-button variant='secondary' onClick={() => setStep2Completed(!step2Completed)}>
                            {step2Completed ? "Completed ✓" : "Mark as done"}
                        </s-button>
                    </s-grid>
                </SetupGuideItem>
                {/* Step 2 - Customize widget - End */}
                {/* Step 3 - Add store logo and check email styling - Start */}
                <SetupGuideItem
                    title="Add store logo and check email styling"
                    description="Upload your store logo and preview how your review request emails will look to customers."
                    isActivated={isActivated === "item3"}
                    onToggle={() => handleToggle("item3")}
                    isCompleted={step3Completed}
                >
                    <s-grid gridTemplateColumns='auto auto' gap='small' justifyContent='start'>
                        <s-button variant='primary' icon='external' href="/app/settings">Go to settings</s-button>
                        <s-button variant='secondary' onClick={() => setStep3Completed(!step3Completed)}>
                            {step3Completed ? "Completed ✓" : "Mark as done"}
                        </s-button>
                    </s-grid>
                </SetupGuideItem>
                {/* Step 3 - Add store logo and check email styling - End */}
            </s-stack>
        </s-section>
    );
}