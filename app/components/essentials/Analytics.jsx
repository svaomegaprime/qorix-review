import Li from "./elements/Li";
import { Text } from "@shopify/polaris";

export default function Analytics() {
    return (
        <s-stack paddingBlockEnd="base">
            <s-query-container>
                <s-grid gap="base" gridTemplateColumns="@container (inline-size > 500px) 340px 192px 192px 192px,1fr">
                    <s-box>
                        <s-section>
                            <s-heading>Feature status</s-heading>
                            <s-stack gap="base" paddingBlockStart="small">
                                <s-grid gridTemplateColumns="50px 1fr auto" gap="small">
                                    <s-stack
                                        alignItems="center"
                                        justifyContent="center"
                                        background="subdued"
                                        borderRadius="base"
                                    >
                                        <s-icon type="currency-convert" />
                                    </s-stack>
                                    <s-stack>
                                        <s-heading>Currency conversion</s-heading>
                                        <s-stack
                                            direction="inline"
                                            alignItems="center"
                                            gap="none large"
                                        >
                                            4 currencies <Li>Auto detect on</Li>
                                        </s-stack>
                                    </s-stack>
                                    <s-switch checked />
                                </s-grid>

                                <s-divider />

                                <s-grid gridTemplateColumns="50px 1fr auto" gap="small">
                                    <s-stack
                                        alignItems="center"
                                        justifyContent="center"
                                        background="subdued"
                                        borderRadius="base"
                                    >
                                        <s-icon type="language-translate" />
                                    </s-stack>
                                    <s-stack>
                                        <s-heading>Language translation</s-heading>
                                        <s-stack direction="inline" alignItems="center" gap="large">
                                            EN <Li>BN</Li> <Li>HI</Li> <Li>AR</Li>
                                        </s-stack>
                                    </s-stack>
                                    <s-switch />
                                </s-grid>
                            </s-stack>
                        </s-section>
                    </s-box>

                    <s-box>
                        <s-section>
                            <s-stack
                                direction="inline"
                                gap="small"
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                <s-heading>Sessions this week</s-heading>
                                <s-icon type="eye-check-mark" />
                            </s-stack>
                            <Text as="h2">0</Text>
                            <s-paragraph color="subdued">
                                Data appears once visitors start switching currency or language
                            </s-paragraph>
                        </s-section>
                    </s-box>

                    <s-box>
                        <s-section>
                            <s-stack
                                direction="inline"
                                gap="small"
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                <s-heading>Currency switches</s-heading>
                                <s-icon type="currency-convert" />
                            </s-stack>
                            <Text as="h2">3,441</Text>
                            <s-paragraph tone="success">↑ 12% vs last week</s-paragraph>
                        </s-section>
                    </s-box>

                    <s-box>
                        <s-section>
                            <s-stack
                                direction="inline"
                                gap="small"
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                <s-heading>Language switches</s-heading>
                                <s-icon type="language-translate" />
                            </s-stack>
                            <Text as="h2">2,759</Text>
                            <s-paragraph tone="success">↑ 8% vs last week</s-paragraph>
                        </s-section>
                    </s-box>
                </s-grid>
            </s-query-container>
        </s-stack>
    );
}