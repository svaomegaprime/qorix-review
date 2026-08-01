/* eslint-disable react/prop-types */
import { getAppEmbedDeepLink } from "../../utils/themeEditorLinks";

export default function AppEmbedStatus({ isAppEnabled = false, shop = "", apiKey = "" }) {
    const embedUrl = getAppEmbedDeepLink({ shop, apiKey, embedHandle: "app_embed" });

    return (
        <s-section>
            <s-stack padding="small" direction="inline" gap="base" alignItems="center" justifyContent="space-between">
                <s-stack gap="small">
                    <s-stack direction="inline" gap="small" alignItems="center">
                        <s-heading>App embed status</s-heading>
                        <s-badge tone={isAppEnabled ? "success" : "warning"}>{isAppEnabled ? "Enabled" : "Setup required"}</s-badge>
                    </s-stack>
                    <s-paragraph color="subdued">Allow the app to display widgets on your storefront</s-paragraph>
                </s-stack>
                <s-stack>
                    <s-button
                        variant="secondary"
                        disabled={isAppEnabled}
                        href={isAppEnabled ? undefined : embedUrl}
                        target="_blank"
                    >
                        {isAppEnabled ? "Enabled" : "Enable now"}
                    </s-button>
                </s-stack>
            </s-stack>
        </s-section>
    );
}