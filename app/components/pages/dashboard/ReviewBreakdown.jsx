import CustomText from "../../essentials/elements/Text"
import CustomSection from "../../essentials/CustomSection"
import ReviewItem from "../../essentials/ReviewItem"
import starFilled from "../../../assets/images/star-filled.svg"
import starEmpty from "../../../assets/images/star-empty.svg"
import ReviewPipeItem from "./elements/ReviewPipeItem"

const TEMP_REVIEW_DATA = [
    {
        id: 1,
        reviewerName: "Osman R.",
        reviewerAvatar: "/reviews/reviewer/reviewer-1.png",
        rating: 4,
        reviewDate: "2 days ago",
        reviewTitle: "Facial Serum Vitamin C",
        reviewDescription: "Amazing product, my skin looks so much better after just 2 weeks. Will definitely reorder.",
        reviewStatus: "Published",
    },
    {
        id: 2,
        reviewerName: "Hasan AB",
        reviewerAvatar: "/reviews/reviewer/reviewer-2.png",
        rating: 5,
        reviewDate: "5 hours ago",
        reviewTitle: "Facial Serum Vitamin C",
        reviewDescription: "Arrived late and packaging was damaged. Product seems fine but not impressed.",
        reviewStatus: "Pending",
    },
    {
        id: 3,
        reviewerName: "Hasan AB",
        reviewerAvatar: "/reviews/reviewer/reviewer-1.png",
        rating: 5,
        reviewDate: "1 week ago",
        reviewTitle: "Facial Serum Vitamin C",
        reviewDescription: "Good results, noticed a difference in about a week. Fast shipping too.",
        reviewStatus: "Rejected",
    }
]

export default function ReviewBreakdown() {
    return (
        <>
            <s-query-container>
                <s-grid gridTemplateColumns="@container (inline-size > 600px) '1fr 340px', 1fr" gap="base">
                    {/* Recent reviews start */}
                    <s-section>
                        <s-stack direction="inline" justifyContent="space-between" alignItems="center" gap="small">
                            <CustomText as="h3">
                                Recent reviews
                            </CustomText>
                            <s-button variant="tertiary">
                                <s-stack direction="inline" alignItems="center">
                                    <s-paragraph tone="success">View all</s-paragraph> <s-icon tone="success" type="arrow-right" />
                                </s-stack>
                            </s-button>
                        </s-stack>
                        <s-grid gap="base" paddingBlockStart="base">
                            {TEMP_REVIEW_DATA.map((review) => (
                                <CustomSection key={review.id}>
                                    <ReviewItem data={review} />
                                </CustomSection>
                            ))}
                        </s-grid>
                    </s-section>
                    {/* Recent reviews end */}

                    <s-grid gap="base">
                        {/* Rating breakdown start */}
                        <s-section>
                            <s-grid gridTemplateColumns="2fr 1fr" justifyContent="space-between" alignItems="center">
                                <s-stack gap="base">
                                    <CustomText as="h3">
                                        Rating breakdown
                                    </CustomText>
                                    <s-box>
                                        <CustomText as="h2">
                                            4.3
                                        </CustomText>
                                        <s-grid gridTemplateColumns="repeat(5, 20px)" alignItems="center">
                                            <s-image src={starFilled} inlineSize="fill" />
                                            <s-image src={starFilled} inlineSize="fill" />
                                            <s-image src={starFilled} inlineSize="fill" />
                                            <s-image src={starFilled} inlineSize="fill" />
                                            <s-image src={starEmpty} inlineSize="fill" />
                                        </s-grid>
                                        <s-paragraph color="subdued">
                                            14 reviews
                                        </s-paragraph>
                                    </s-box>
                                </s-stack>
                                <s-stack>
                                    <ReviewPipeItem starFor={5} totalReviews={14} earnedReviews={8} />
                                    <ReviewPipeItem starFor={4} totalReviews={14} earnedReviews={3} />
                                    <ReviewPipeItem starFor={3} totalReviews={14} earnedReviews={2} />
                                    <ReviewPipeItem starFor={2} totalReviews={14} earnedReviews={1} />
                                    <ReviewPipeItem starFor={1} totalReviews={14} earnedReviews={0} />
                                </s-stack>
                            </s-grid>
                        </s-section>
                        {/* Rating breakdown end */}

                        {/* App features status start */}
                        <s-section>
                            <CustomText as="h3">
                                Status
                            </CustomText>
                            <s-stack paddingBlockStart="small" gap="small">
                                <CustomSection>
                                    <s-grid gridTemplateColumns="1fr auto" justifyContent="space-between" alignItems="center" gap="small">
                                        <s-heading>
                                            Widgets
                                        </s-heading>
                                        <s-badge tone="warning">
                                            Embed disbled
                                        </s-badge>
                                    </s-grid>
                                </CustomSection>
                                <CustomSection>
                                    <s-grid gridTemplateColumns="1fr auto" justifyContent="space-between" alignItems="center" gap="small">
                                        <s-heading>
                                            Requests
                                        </s-heading>
                                        <s-badge tone="success">
                                            Requests enabled
                                        </s-badge>
                                    </s-grid>
                                </CustomSection>
                            </s-stack>
                        </s-section>
                        {/* App features status end */}
                        {/* Quick actions start */}
                        <s-section>
                            <CustomText as="h3">
                                Quick actions
                            </CustomText>
                            <s-grid gridTemplateColumns="1fr 1fr" gap="small" paddingBlockStart="small">
                                <s-grid-item>
                                    <s-clickable padding="base" borderRadius="large" overflow="hidden" border="base">
                                        <s-stack gap="small">
                                            <s-avatar src="/inbox-icon.svg" />
                                            <s-heading>Request reviews</s-heading>
                                        </s-stack>
                                    </s-clickable>
                                </s-grid-item>
                                <s-grid-item>
                                    <s-clickable padding="base" borderRadius="large" overflow="hidden" border="base">
                                        <s-stack gap="small">
                                            <s-avatar src="/settings-icon.svg" />
                                            <s-heading>App settings</s-heading>
                                        </s-stack>
                                    </s-clickable>
                                </s-grid-item>
                                <s-grid-item gridColumn="span 2">
                                    <s-clickable padding="base" borderRadius="large" overflow="hidden" border="base">
                                        <s-stack gap="small">
                                            <s-avatar src="/desktop-icon.svg" />
                                            <s-heading>Customize widget</s-heading>
                                        </s-stack>
                                    </s-clickable>
                                </s-grid-item>
                            </s-grid>
                        </s-section>
                        {/* Quick actions end */}
                    </s-grid>
                </s-grid>
            </s-query-container>
        </>
    )
}