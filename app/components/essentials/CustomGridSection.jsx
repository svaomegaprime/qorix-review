export default function CustomGridSection({
    heading,
    description,
    children,
    badge
}) {
    return (
        <s-stack padding="large">
            <s-query-container>
                <s-grid gridTemplateColumns="@container (inline-size < 590px) 1fr, 5fr 7fr" gap="base">
                    <s-grid-item>
                        <div style={{ display: "grid", gap: "5px" }}>
                            <s-stack direction="inline" gap="small">
                                <s-heading>{heading}</s-heading>
                                {badge?.tone && (
                                    <s-badge tone={badge?.tone}>{badge?.text}</s-badge>
                                )}
                            </s-stack>
                            <s-paragraph color="subdued">{description}</s-paragraph>
                        </div>
                    </s-grid-item>
                    <s-grid-item>
                        {children}
                    </s-grid-item>
                </s-grid>
            </s-query-container>
        </s-stack>
    )
}