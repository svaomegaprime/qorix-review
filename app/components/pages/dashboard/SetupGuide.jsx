import { useEffect, useState } from "react";
import ProgressiveBar from "./elements/ProgressiveBar";
import SetupGuideItem from "./elements/SetupGuideItem";
import { useRevalidator } from "react-router";
import { getAppEmbedDeepLink } from "../../../utils/themeEditorLinks";

const DEFAULT_ACTIVE_ITEM = "item1";

export default function SetupGuide({ shop = "", apiKey = "", isAppEnabled = false, isEmailConfigured = false }) {
    const [isActivated, setIsActivated] = useState(DEFAULT_ACTIVE_ITEM);
    const [step2Completed, setStep2Completed] = useState(false);
    const [step3Completed, setStep3Completed] = useState(false);
    const revalidator = useRevalidator();
    const isVerifying = revalidator.state === "loading";

    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedStep2 = localStorage.getItem("qorix_setup_step2") === "true";
            const savedStep3 = localStorage.getItem("qorix_setup_step3") === "true";
            setStep2Completed(savedStep2);
            setStep3Completed(savedStep3);
            if (isAppEnabled && !savedStep2) {
                setIsActivated("item2");
            } else if (isAppEnabled && savedStep2 && !savedStep3) {
                setIsActivated("item3");
            }
        }
    }, [isAppEnabled]);

    const handleToggle = (item) => {
        setIsActivated(item);
    };

    const handleToggleStep2 = () => {
        const nextState = !step2Completed;
        setStep2Completed(nextState);
        if (typeof window !== "undefined") {
            localStorage.setItem("qorix_setup_step2", String(nextState));
        }
        if (nextState) {
            setIsActivated("item3");
        }
    };

    const handleToggleStep3 = () => {
        if (!isEmailConfigured && !step3Completed) {
            if (typeof shopify !== "undefined" && shopify.toast) {
                shopify.toast.show("Please fill up your email settings (SMTP User, Password, Port, Host)", { isError: true });
            }
            return;
        }

        const nextState = !step3Completed;
        setStep3Completed(nextState);
        if (typeof window !== "undefined") {
            localStorage.setItem("qorix_setup_step3", String(nextState));
        }
        if (nextState && typeof shopify !== "undefined" && shopify.toast) {
            shopify.toast.show("Email settings completed successfully! 🎉");
        }
    };

    const handleVerifyInstallation = () => {
        revalidator.revalidate();
    };

    const isStep3Done = isEmailConfigured || step3Completed;
    const completedSteps = (isAppEnabled ? 1 : 0) + (step2Completed ? 1 : 0) + (isStep3Done ? 1 : 0);
    const embedUrl = getAppEmbedDeepLink({ shop, apiKey, embedHandle: "app_embed" });

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
                            href={embedUrl}
                            target="_blank"
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
                        <s-button variant='secondary' onClick={handleToggleStep2}>
                            {step2Completed ? "Completed ✓" : "Mark as done"}
                        </s-button>
                    </s-grid>
                </SetupGuideItem>
                {/* Step 2 - Customize widget - End */}
                {/* Step 3 - Add store logo and check email styling - Start */}
                <SetupGuideItem
                    title="Configure email settings"
                    description="Set up your email settings to send review request emails to customers."
                    isActivated={isActivated === "item3"}
                    onToggle={() => handleToggle("item3")}
                    isCompleted={isStep3Done}
                >
                    <s-grid gridTemplateColumns='auto auto' gap='small' justifyContent='start'>
                        <s-button variant='primary' icon='external' href="/app/settings/email-settings">Go to settings</s-button>
                        <s-button variant='secondary' onClick={handleToggleStep3}>
                            {isStep3Done ? "Completed ✓" : "Mark as done"}
                        </s-button>
                    </s-grid>
                </SetupGuideItem>
                {/* Step 3 - Add store logo and check email styling - End */}
            </s-stack>
        </s-section>
    );
}