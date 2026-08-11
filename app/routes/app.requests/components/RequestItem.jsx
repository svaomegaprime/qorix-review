import StatusTrack from "./essentials/StatusTrack";
import starFilled from "../../../assets/images/star-filled.svg";
import starEmpty from "../../../assets/images/star-empty.svg";
export default function RequestItem({
  data,
  handleReminderEmailSend,
  handleRetryEmailSend,
}) {
  return (
    <>
      <s-modal
        id={`order-details-modal-${data?.orderId}`}
        heading="Order Details"
      >
        <s-stack gap="base">
          {/* Customer info */}
          <s-section>
            <s-stack direction="inline" gap="base" alignItems="center">
              <s-avatar size="large" borderRadius="full" src={data?.avatar} />
              <div style={{ display: "grid", gap: "4px" }}>
                <s-heading>{data?.fullName}</s-heading>
                <s-stack direction="inline" gap="small" alignItems="center">
                  <s-paragraph>{data?.email}</s-paragraph>
                  <s-badge tone={data?.emailVerified ? "success" : "critical"}>
                    {data?.emailVerified ? "Verified" : "Not verified"}
                  </s-badge>
                </s-stack>
              </div>
            </s-stack>
          </s-section>

          <s-divider />

          {/* Order info */}
          <s-section>
            <s-heading>Order Information</s-heading>
            <s-stack gap="small" style={{ paddingTop: "8px" }}>
              <s-grid gridTemplateColumns="1fr 1fr" gap="small">
                <div>
                  <s-text tone="subdued">Order ID</s-text>
                  <s-paragraph>{data?.orderId}</s-paragraph>
                </div>
                <div>
                  <s-text tone="subdued">Date</s-text>
                  <s-paragraph>
                    {data?.createdAt
                      ? new Date(data.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "-"}
                  </s-paragraph>
                </div>
                <div>
                  <s-text tone="subdued">Payment</s-text>
                  <s-badge
                    tone={data?.status === "PAID" ? "success" : "warning"}
                  >
                    {data?.status}
                  </s-badge>
                </div>
                <div>
                  <s-text tone="subdued">Fulfillment</s-text>
                  <s-badge
                    tone={
                      data?.fulfillmentStatus === "FULFILLED"
                        ? "success"
                        : "warning"
                    }
                  >
                    {data?.fulfillmentStatus}
                  </s-badge>
                </div>
                <div>
                  <s-text tone="subdued">Total</s-text>
                  <s-paragraph>
                    {data?.currency} {data?.totalPrice}
                  </s-paragraph>
                </div>
                <div>
                  <s-text tone="subdued">Time</s-text>
                  <s-paragraph>{data?.timeAgo}</s-paragraph>
                </div>
              </s-grid>
            </s-stack>
          </s-section>

          <s-divider />

          {/* Products */}
          <s-section>
            <s-heading>Products ({data?.products?.length ?? 0})</s-heading>
            <s-stack gap="small" style={{ paddingTop: "8px" }}>
              {data?.products?.map((product, index) => (
                <div key={product?.productId ?? index}>
                  <s-grid
                    gridTemplateColumns="1fr auto"
                    alignItems="center"
                    gap="base"
                  >
                    <div style={{ display: "grid", gap: "2px" }}>
                      <s-stack
                        direction="inline"
                        gap="small"
                        alignItems="center"
                      >
                        <s-paragraph>{product?.title}</s-paragraph>
                        {product?.isReviewed ? (
                          <s-badge tone="success">REVIEWED</s-badge>
                        ) : (
                          <s-badge tone="caution">NOT REVIEWED</s-badge>
                        )}
                      </s-stack>
                      <s-text tone="subdued">Qty: {product?.quantity}</s-text>
                    </div>
                  </s-grid>
                </div>
              ))}
            </s-stack>
          </s-section>

          <s-divider />

          {/* Review request status */}
          <s-section>
            <s-heading>Review Request</s-heading>
            <s-stack
              direction="inline"
              gap="small"
              alignItems="center"
              style={{ paddingTop: "8px" }}
            >
              <Badges status={data?.reviewCheckStatus} />
              {data?.requestType && (
                <s-badge
                  tone={data?.requestType === "AUTOMATIC" ? "info" : "caution"}
                >
                  {data?.requestType}
                </s-badge>
              )}
            </s-stack>
          </s-section>
        </s-stack>

        <s-button
          slot="secondary-actions"
          commandFor={`order-details-modal-${data?.orderId}`}
          command="--hide"
        >
          Close
        </s-button>
      </s-modal>
      <s-stack>
        {/* Start----Request header */}
        <s-stack
          direction="inline"
          gap="base"
          alignItems="center"
          justifyContent="space-between"
        >
          <s-stack direction="inline" gap="small" alignItems="center">
            <s-avatar size="medium" borderRadius="full" src={data?.avatar} />
            <s-heading>{data?.fullName}</s-heading>
          </s-stack>
          <s-stack alignItems="end" gap="small">
            <s-text>{data?.timeAgo}</s-text>
            <s-grid gridTemplateColumns="repeat(5, 25px)">
              {data?.reviews && data.reviews.length > 0 && (
                // <s-stack direction="inline" gap="4px">
                <>
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const averageRating = Math.round(
                      data.reviews.reduce(
                        (acc, curr) => acc + (curr.rating || 0),
                        0,
                      ) / data.reviews.length,
                    );
                    return (
                      <s-image
                        key={idx}
                        src={idx < averageRating ? starFilled : starEmpty}
                        style={{ width: "16px", height: "16px" }}
                      />
                    );
                  })}
                </>
                // </s-stack>
              )}
            </s-grid>
          </s-stack>
        </s-stack>
        {/* End----Request header */}
        {/* Start----Request content */}
        <div style={{ display: "grid", gap: "4px", paddingTop: "7px" }}>
          {/* Start----Request email */}
          <s-paragraph>{data?.email}</s-paragraph>
          {/* End----Request email */}
          {/* Start----Request title */}
          {/* <s-heading>{data?.products[0]?.title}</s-heading> */}
          {/* End----Request title */}
          <s-stack direction="inline" gap="small">
            <s-paragraph>Order {data?.orderId}</s-paragraph>
            {data?.status && (
              <s-badge tone={data?.status === "PAID" ? "success" : "critical"}>
                {data?.status}
              </s-badge>
            )}
          </s-stack>
        </div>
        {/* End----Request content */}

        {/* Start----Status track */}
        <StatusTrack status={data?.reviewCheckStatus} />
        {/* End----Status track */}

        {/* Start----Request actions */}
        <s-grid
          gridTemplateColumns="auto auto"
          paddingBlockStart="small"
          justifyContent="space-between"
          alignItems="center"
          gap="base"
        >
          {/* Start----Request status */}
          <s-stack direction="inline" gap="small" alignItems="center">
            <Badges
              status={data?.reviewCheckStatus}
              paymentStatus={data?.status}
            />
            {data?.requestType && (
              <s-badge
                tone={data?.requestType === "AUTOMATIC" ? "info" : "caution"}
              >
                {data?.requestType}
              </s-badge>
            )}
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
            <ActionButtons
              data={data}
              status={data?.reviewCheckStatus}
              reminded={true}
              handleReminderEmailSend={handleReminderEmailSend}
              handleRetryEmailSend={handleRetryEmailSend}
            />
          </div>
          {/* End----Request action buttons */}
        </s-grid>
        {/* End----Request actions */}
      </s-stack>
    </>
  );
}

export function ActionButtons({
  status,
  reminded,
  data,
  handleReminderEmailSend,
  handleRetryEmailSend,
}) {
  return (
    <>
      {status === "OPENED" && reminded && (
        <s-button
          icon="notification"
          onClick={() => handleReminderEmailSend(data)}
        >
          Send reminder
        </s-button>
      )}
      {status === "FAILED" && (
        <s-button icon="refresh" onClick={() => handleRetryEmailSend(data)}>
          Retry
        </s-button>
      )}
      <s-button
        commandFor={`order-details-modal-${data?.orderId}`}
        command="--show"
        icon="domain"
      >
        View order
      </s-button>
    </>
  );
}

export function Badges({ status, paymentStatus }) {
  console.log(paymentStatus);
  let tone = "neutral";
  switch (status) {
    case "SENT":
      tone = "warning";
      break;
    case "OPENED":
      tone = "info";
      break;
    case "REVIEWED":
      tone = "success";
      break;
    case "FAILED":
      tone = "critical";
      break;
    default:
      tone = "neutral";
  }
  return (
    <>
      <s-badge tone={tone}>{status}</s-badge>
    </>
  );
}
