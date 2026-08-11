import { useEffect, useState } from "react";
import ProgressiveBar from "./elements/ProgressiveBar";
import SetupGuideItem from "./elements/SetupGuideItem";
import { useRevalidator } from "react-router";
import { getAppEmbedDeepLink, getAppBlockDeepLink } from "../../../utils/themeEditorLinks";

const DEFAULT_ACTIVE_ITEM = "item1";

export default function SetupGuide({ shop = "", apiKey = "", isAppEnabled = false, isQuickReviewInstalled = false, isEmailConfigured = false }) {
    const [isActivated, setIsActivated] = useState(DEFAULT_ACTIVE_ITEM);
    const [verifyingStep, setVerifyingStep] = useState(null);
    const [showToastForStep, setShowToastForStep] = useState(null);
    const revalidator = useRevalidator();
    const isVerifying = revalidator.state === "loading" || verifyingStep !== null;

    useEffect(() => {
        if (typeof window !== "undefined") {
            if (!isAppEnabled) {
                setIsActivated("item1");
            } else if (!isQuickReviewInstalled) {
                setIsActivated("item2");
            } else if (!isEmailConfigured) {
                setIsActivated("item3");
            }
        }
    }, [isAppEnabled, isQuickReviewInstalled, isEmailConfigured]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible" && revalidator.state === "idle") {
                revalidator.revalidate();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("focus", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("focus", handleVisibilityChange);
        };
    }, [revalidator]);

    const handleToggle = (item) => {
        setIsActivated(item);
    };

    const handleVerifyInstallation = (step) => {
        setVerifyingStep(step);
        revalidator.revalidate();
        
        setTimeout(() => {
            setVerifyingStep(null);
            setShowToastForStep(step);
        }, 1000);
    };

    useEffect(() => {
        if (showToastForStep !== null) {
            if (typeof shopify !== "undefined" && shopify.toast) {
                if (showToastForStep === 1 && !isAppEnabled) {
                    shopify.toast.show("Enable app embed in your live theme", { isError: true });
                } else if (showToastForStep === 2 && (!isAppEnabled || !isQuickReviewInstalled)) {
                    shopify.toast.show(!isAppEnabled ? "Enable app embed in your live theme first" : "Please install quick review widget from the widgets page", { isError: true });
                } else if (showToastForStep === 3 && !isEmailConfigured) {
                    shopify.toast.show("Please fill up your email settings (SMTP User, Password, Port, Host)", { isError: true });
                } else {
                    shopify.toast.show("Verified successfully! 🎉");
                }
            }
            setShowToastForStep(null);
        }
    }, [showToastForStep, isAppEnabled, isQuickReviewInstalled, isEmailConfigured]);

    const isStep2Done = isAppEnabled && isQuickReviewInstalled;
    const isStep3Done = isEmailConfigured;
    const completedSteps = (isAppEnabled ? 1 : 0) + (isStep2Done ? 1 : 0) + (isStep3Done ? 1 : 0);
    const embedUrl = getAppEmbedDeepLink({ shop, apiKey, embedHandle: "app_embed" });
    const quickReviewUrl = getAppBlockDeepLink({ shop, apiKey, blockHandle: "quick_review", template: "product", target: "newAppsSection" });

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
                            onClick={() => handleVerifyInstallation(1)}
                        >
                            {isAppEnabled ? "Verified ✓" : "Verify Installation"}
                        </s-button>
                    </s-grid>
                </SetupGuideItem>
                {/* Step 1 - Enable app embed - End */}
                {/* Step 2 - Customize widget - Start */}
                <SetupGuideItem
                    title="Enable Quick Review widget"
                    description="Add the Quick Review widget to your product pages in the theme editor to showcase customer reviews."
                    isActivated={isActivated === "item2"}
                    onToggle={() => handleToggle("item2")}
                    isCompleted={isStep2Done}
                >
                    <s-grid gridTemplateColumns='auto auto' gap='small' justifyContent='start'>
                        <s-button variant='primary' icon='external' href={quickReviewUrl} target="_blank">Open theme editor</s-button>
                        <s-button
                            variant="secondary"
                            loading={isVerifying}
                            onClick={() => handleVerifyInstallation(2)}
                        >
                            {isStep2Done ? "Verified ✓" : "Verify Setup"}
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
                        <s-button
                            variant="secondary"
                            loading={isVerifying}
                            onClick={() => handleVerifyInstallation(3)}
                        >
                            {isStep3Done ? "Verified ✓" : "Verify Setup"}
                        </s-button>
                    </s-grid>
                </SetupGuideItem>
                {/* Step 3 - Add store logo and check email styling - End */}
            </s-stack>
        </s-section>
    );
}