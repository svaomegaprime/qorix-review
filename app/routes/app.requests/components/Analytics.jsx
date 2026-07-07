/* eslint-disable react/prop-types */
import { Text } from "@shopify/polaris";
import CustomText from "../../../components/essentials/elements/Text";

const countByStatus = (requests, statuses) => (
    requests.filter((request) =>
        statuses.includes(request.reviewCheckStatus),
    ).length
);

const formatRate = (value, total) => {
    if (total === 0) {
        return "0%";
    }

    return `${Math.round((value / total) * 100)}%`;
};

const getTrendMeta = (value) => {
    if (value > 0) {
        return {
            arrow: "\u2191",
            color: "#00BF7A",
        };
    }

    if (value < 0) {
        return {
            arrow: "\u2193",
            color: "#ed0027",
        };
    }

    return {
        arrow: "-",
        color: "#616161",
    };
};

export default function Analytics({ data = [] }) {
    const totalRequests = data.length;
    const openedRequests = countByStatus(data, ["OPENED", "REVIEWED"]);
    const reviewedRequests = countByStatus(data, ["REVIEWED"]);
    const failedRequests = countByStatus(data, ["FAILED"]);
    const totalTrend = getTrendMeta(totalRequests);
    const openedTrend = getTrendMeta(openedRequests);
    const reviewedTrend = getTrendMeta(reviewedRequests);
    const failedTrend = getTrendMeta(failedRequests > 0 ? -failedRequests : 0);

    return (
        <s-stack paddingBlock="small base">
            <s-query-container>
                <s-grid gap="base" gridTemplateColumns="@container (inline-size > 500px) 'repeat(4, 1fr)', 'repeat(2, 1fr)'">
                    {/* Total requests sent start */}
                    <s-section>
                        <s-heading>Total sent</s-heading>
                        <Text as="h2">{totalRequests}</Text>
                        <CustomText as="p" color={totalTrend.color}>
                            {totalTrend.arrow} {totalRequests} request{totalRequests === 1 ? "" : "s"}
                        </CustomText>
                    </s-section>
                    {/* Total requests sent end */}
                    {/* Total open rate start */}
                    <s-section>
                        <s-heading>Open rate</s-heading>
                        <Text as="h2">{formatRate(openedRequests, totalRequests)}</Text>
                        <CustomText as="p" color={openedTrend.color}>
                            {openedTrend.arrow} {openedRequests} opened
                        </CustomText>
                    </s-section>
                    {/* Total open rate end */}
                   
                    {/* Total conversion rate start */}
                    <s-section>
                        <s-heading>Conversion</s-heading>
                        <Text as="h2">{formatRate(reviewedRequests, totalRequests)}</Text>
                        <CustomText as="p" color={reviewedTrend.color}>
                            {reviewedTrend.arrow} {reviewedRequests} reviewed
                        </CustomText>
                    </s-section>
                    {/* Total conversion rate end */}
                    {/* Failed requests start */}
                    <s-section>
                        <s-heading>Failed</s-heading>
                        <Text as="h2">{failedRequests}</Text>
                        <CustomText as="p" color={failedTrend.color}>
                            {failedTrend.arrow} {failedRequests} failed
                        </CustomText>
                    </s-section>
                    {/* Failed requests end */}
                </s-grid>
            </s-query-container>
        </s-stack>
    );
}
