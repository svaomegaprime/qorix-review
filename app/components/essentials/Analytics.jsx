import { Text } from "@shopify/polaris";
import starFilled from "../../assets/images/star-filled.svg"
import starEmpty from "../../assets/images/star-empty.svg"
import CustomText from "../essentials/elements/Text"

export default function Analytics() {
    const arrowUp = '↑';
    const arrowDown = '↓';
    return (
        <s-stack paddingBlockEnd="base">
            <s-query-container>
                <s-grid gap="base" gridTemplateColumns="@container (inline-size > 500px) 'repeat(4, 1fr)', 'repeat(2, 1fr)'">
                    {/* Total reviews start */}
                    <s-box>
                        <s-section>
                            <s-stack
                                direction="inline"
                                gap="small"
                                alignItems="center"
                                justifyContent="space-between"
                                >
                                <s-heading>Total reviews</s-heading>
                                <s-icon type="plan" />
                            </s-stack>
                            <Text as="h2">14</Text>
                            <CustomText as="p" color={"#00BF7A"}>
                                {arrowUp} 5 this week
                            </CustomText>
                        </s-section>
                    </s-box>
                    {/* Total reviews end */}
                    {/* Avg. rating start */}
                    <s-box>
                        <s-section>
                            <s-stack
                                direction="inline"
                                gap="small"
                                alignItems="center"
                                justifyContent="space-between"
                                >
                                <s-heading>Avg. rating</s-heading>
                                <s-icon type="star-list" />
                            </s-stack>
                            <Text as="h2">4.3</Text>
                            <s-grid gridTemplateColumns="repeat(5, 20px)" alignItems="center">
                                <s-image src={starFilled} inlineSize="fill" />
                                <s-image src={starFilled} inlineSize="fill" />
                                <s-image src={starFilled} inlineSize="fill" />
                                <s-image src={starFilled} inlineSize="fill" />
                                <s-image src={starEmpty} inlineSize="fill" />
                            </s-grid>
                        </s-section>
                    </s-box>
                    {/* Avg. rating end */}
                    {/* Requests sent start */}
                    <s-box>
                        <s-section>
                            <s-stack
                                direction="inline"
                                gap="small"
                                alignItems="center"
                                justifyContent="space-between"
                                >
                                <s-heading>Requests sent</s-heading>
                                <s-icon type="send" />
                            </s-stack>
                            <Text as="h2">22</Text>
                            <s-paragraph>
                                Last 30 days
                            </s-paragraph>
                        </s-section>
                    </s-box>
                    {/* Requests sent end */}
                    {/* Pending reviews start */}
                    <s-box>
                        <s-section>
                            <s-stack
                                direction="inline"
                                gap="small"
                                alignItems="center"
                                justifyContent="space-between"
                                >
                                <s-heading>Pending</s-heading>
                                <s-icon type="clock" />
                            </s-stack>
                            <Text as="h2">2</Text>
                            <CustomText as="p" color={"#FF9500"}>
                                Needs moderation
                            </CustomText>
                        </s-section>
                    </s-box>
                    {/* Pending reviews end */}
                </s-grid>
            </s-query-container>
        </s-stack>
    );
}