import starFilled from "../../assets/images/star-filled.svg"
import starEmpty from "../../assets/images/star-empty.svg"
export default function ReviewItem({
    data
}) {
    return (
        <>
            <s-stack direction="inline" gap="base" alignItems="center" justifyContent="space-between">
                <s-stack direction="inline" gap="small" alignItems="center">
                    <s-avatar size="medium" borderRadius="full" src={data.reviewerAvatar} />
                    <s-heading>{data.reviewerName}</s-heading>
                </s-stack>
                <s-text>{data.reviewDate}</s-text>
            </s-stack>
            <s-grid gridTemplateColumns="repeat(5, 20px)" alignItems="center" paddingBlockStart="small">
                {[...Array(data.rating)].map((_, index) => (
                    <s-image key={index} src={starFilled} inlineSize="fill" />
                ))}
                {[...Array(5 - data.rating)].map((_, index) => (
                    <s-image key={index} src={starEmpty} inlineSize="fill" />
                ))}
            </s-grid>
            <div style={{ display: 'grid', gap: '4px', paddingTop: '7px' }}>
                <s-heading>
                    {data.reviewTitle}
                </s-heading>
                <s-paragraph color="subdued">
                    {data.reviewDescription}
                </s-paragraph>
            </div>
            <s-grid gridTemplateColumns="auto auto" paddingBlockStart="small" justifyContent="space-between" alignItems="center" gap="base">
                <s-badge tone={
                    data.reviewStatus === "Pending" ? "caution" : data.reviewStatus === "Published" ? "success" : "critical"
                }>{data.reviewStatus}</s-badge>
                <div
                    style={{
                        display: "grid",
                        gridAutoFlow: "column",
                        gridAutoColumns: "max-content",
                        gap: "12px 8px",
                    }}
                    >
                    <ActionButtons reviewStatus={data.reviewStatus} />
                    <s-button icon="delete"/>
                </div>
            </s-grid>
        </>
    )
}

export function ActionButtons({ reviewStatus }) {
    if (reviewStatus === "Pending") {
        return (
            <>
                <s-button icon="check">Approve</s-button>
                <s-button icon="x">Reject</s-button>
            </>
        )
    } else if (reviewStatus === "Published") {
        return (
            <>
                <s-button icon="chat">Reply</s-button>
                <s-button icon="arrow-down">Unpublish</s-button>
            </>
        )
    } else {
        return (
            <>
                <s-button icon="arrow-up">Republish</s-button>
            </>
        )
    }
}