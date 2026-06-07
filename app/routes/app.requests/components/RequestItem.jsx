import StatusTrack from "./essentials/StatusTrack"

export default function RequestItem({
    data
}) {
    return (
        <s-stack>
            {/* Start----Request header */}
            <s-stack direction="inline" gap="base" alignItems="center" justifyContent="space-between">
                <s-stack direction="inline" gap="small" alignItems="center">
                    <s-avatar size="medium" borderRadius="full" src={data?.avatar} />
                    <s-heading>{data?.name}</s-heading>
                </s-stack>
                <s-text>{data?.date}</s-text>
            </s-stack>
            {/* End----Request header */}
            {/* Start----Request content */}
            <div style={{ display: 'grid', gap: '4px', paddingTop: '7px' }}>
                {/* Start----Request email */}
                <s-paragraph>
                    {data?.email}
                </s-paragraph>
                {/* End----Request email */}
                {/* Start----Request title */}
                <s-heading>
                    {data?.title}
                </s-heading>
                {/* End----Request title */}
                <s-paragraph>
                    Order {data?.orderId}
                </s-paragraph>
            </div>
            {/* End----Request content */}

            {/* Start----Status track */}
            <StatusTrack status={data?.status} />
            {/* End----Status track */}
            
            {/* Start----Request actions */}
            <s-grid gridTemplateColumns="auto auto" paddingBlockStart="small" justifyContent="space-between" alignItems="center" gap="base">
                {/* Start----Request status */}
                <s-stack direction="inline" gap="small" alignItems="center">
                    <Badges status={data?.status} reminded={data?.reminded} />
                    <s-badge tone="info">{data?.type}</s-badge>
                </s-stack>
                {/* End----Request status */}
                {/* Start----Request action buttons */}
                <div
                    style={{
                        display: "grid",
                        gridAutoFlow: "column",
                        gridAutoColumns: "max-content",
                        gap: "12px 8px",
                    }}
                >
                    <ActionButtons status={data?.status} reminded={data?.reminded} />
                </div>
                {/* End----Request action buttons */}
            </s-grid>
            {/* End----Request actions */}
        </s-stack>
    )
}

export function ActionButtons({ status, reminded }) {
    return(
        <>
            {status === "Opened" && reminded === false && <s-button icon="notification">Send reminder</s-button>}
            {status === "Failed" && <s-button icon="refresh">Retry</s-button>}
            <s-button icon="domain">View order</s-button>
        </>
    )
}

export function Badges({status, reminded}){
    if(status === "Reviewed"){
        return <s-badge tone="success">Reviewed</s-badge>;
    }
    if(status === "Opened"){
        return (
            <>
                <s-badge tone="success">Opened</s-badge>
                {reminded === false && <s-badge tone="caution">Reminder</s-badge>}
            </>
        );
    }
    if(status === "Failed"){
        return <s-badge tone="critical">Failed</s-badge>;
    }
}
