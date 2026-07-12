import { Text } from "@shopify/polaris";
import starFilled from "../../assets/images/star-filled.svg"
import starEmpty from "../../assets/images/star-empty.svg"
import CustomText from "../essentials/elements/Text"

export default function Analytics({ reviews = [], pendingOrders }) {
    const arrowUp = '↑';
    const arrowDown = '↓';

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews)
        : 0;
    const pendingReviews = reviews.filter(r => r.status === "PENDING").length;

    const roundedRating = Math.round(avgRating);
    const stars = Array.from({ length: 5 }, (_, i) => i < roundedRating);

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
                            <Text as="h2">{totalReviews}</Text>
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
                            <Text as="h2">{avgRating.toFixed(1)}</Text>
                            <s-grid gridTemplateColumns="repeat(5, 20px)" alignItems="center">
                                {stars.map((isFilled, idx) => (
                                    <s-image key={idx} src={isFilled ? starFilled : starEmpty} inlineSize="fill" />
                                ))}
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
                            <Text as="h2">{pendingOrders?.length ?? 0}</Text>
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
                            <Text as="h2">{pendingReviews}</Text>
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