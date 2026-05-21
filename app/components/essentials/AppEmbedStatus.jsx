export default function AppEmbedStatus({ isAppEnabled }) {
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
                    <s-button variant="secondary" disabled={isAppEnabled}>{isAppEnabled ? "Enabled" : "Enable now"}</s-button>
                </s-stack>
            </s-stack>
        </s-section>
    )
}