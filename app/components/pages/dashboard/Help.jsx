export default function Help() {
    return (
        <s-section>
            <s-heading>Need help?</s-heading>
            <s-stack>
                <s-grid gridTemplateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap="base">
                    <s-grid-item>
                        <s-clickable border="base" borderRadius="large" overflow="hidden">
                            <div style={{ background: "#fff", padding: "20px 15px" }}>
                                <s-grid gridTemplateColumns="auto 1fr" gap="small">
                                    <s-stack direction="inline" alignItems="center" justifyContent="center" background="subdued" borderRadius="base" padding="small base">
                                        <s-icon type="question-circle" />
                                    </s-stack>
                                    <s-stack>
                                        <s-heading>Help Center</s-heading>
                                        <s-paragraph>Browse guides and tutorials</s-paragraph>
                                    </s-stack>
                                </s-grid>
                            </div>
                        </s-clickable>
                    </s-grid-item>
                    <s-grid-item>
                        <s-clickable border="base" borderRadius="large" overflow="hidden">
                            <div style={{ background: "#fff", padding: "20px 15px" }}>
                                <s-grid gridTemplateColumns="auto 1fr" gap="small">
                                    <s-stack direction="inline" alignItems="center" justifyContent="center" background="subdued" borderRadius="base" padding="small base">
                                        <s-icon type="chat" />
                                    </s-stack>
                                    <s-stack>
                                        <s-heading>Contact support</s-heading>
                                        <s-paragraph>Get help from our team</s-paragraph>
                                    </s-stack>
                                </s-grid>
                            </div>
                        </s-clickable>
                    </s-grid-item>
                </s-grid>
            </s-stack>
        </s-section>
    )
}