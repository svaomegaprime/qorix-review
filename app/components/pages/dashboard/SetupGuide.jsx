import { useEffect, useState } from "react";
import ProgressiveBar from "./elements/ProgressiveBar";
import SetupGuideItem from "./elements/SetupGuideItem";
import { useRevalidator } from "react-router";
import { getAppEmbedDeepLink } from "../../../utils/themeEditorLinks";

const DEFAULT_ACTIVE_ITEM = "item1";

export default function SetupGuide({ shop = "", apiKey = "", isAppEnabled = false, isQuickReviewInstalled = false, isEmailConfigured = false }) {
    const [isActivated, setIsActivated] = useState(DEFAULT_ACTIVE_ITEM);
    const [verifyingStep, setVerifyingStep] = useState(null);
    const [wasVerifying, setWasVerifying] = useState(false);
    const revalidator = useRevalidator();
    const isVerifying = revalidator.state === "loading";

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
    };

    useEffect(() => {
        if (isVerifying) {
            setWasVerifying(true);
        } else if (!isVerifying && wasVerifying && verifyingStep !== null) {
            if (typeof shopify !== "undefined" && shopify.toast) {
                if (verifyingStep === 1 && !isAppEnabled) {
                    shopify.toast.show("Please enable app embed first", { isError: true });
                } else if (verifyingStep === 2 && (!isAppEnabled || !isQuickReviewInstalled)) {
                    shopify.toast.show(!isAppEnabled ? "Please enable app embed first" : "Please install Quick Review widget from the Widgets page", { isError: true });
                } else if (verifyingStep === 3 && !isEmailConfigured) {
                    shopify.toast.show("Please fill up your email settings (SMTP User, Password, Port, Host)", { isError: true });
                } else {
                    shopify.toast.show("Verified successfully! 🎉");
                }
            }
            setVerifyingStep(null);
            setWasVerifying(false);
        }
    }, [isVerifying, wasVerifying, verifyingStep, isAppEnabled, isQuickReviewInstalled, isEmailConfigured]);

    const isStep2Done = isAppEnabled && isQuickReviewInstalled;
    const isStep3Done = isEmailConfigured;
    const completedSteps = (isAppEnabled ? 1 : 0) + (isStep2Done ? 1 : 0) + (isStep3Done ? 1 : 0);
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
                    description="Install the Quick Review widget from the widgets page to display reviews on your products."
                    isActivated={isActivated === "item2"}
                    onToggle={() => handleToggle("item2")}
                    isCompleted={isStep2Done}
                >
                    <s-grid gridTemplateColumns='auto auto' gap='small' justifyContent='start'>
                        <s-button variant='primary' icon='external' href="/app/widgets">Go to widget settings</s-button>
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