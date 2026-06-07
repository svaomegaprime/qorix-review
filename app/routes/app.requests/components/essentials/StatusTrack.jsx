import Text from "../../../../components/essentials/elements/Text";

const STEPS = ["Sent", "Opened", "Clicked", "Reviewed"];
const STATUS_STEP_INDEX = {
    Sent: 0,
    Opened: 1,
    Clicked: 2,
    Reviewed: 3,
};

const COLORS = {
    completed: "#00bf7a",
    pending: "#8F7300",
    inactive: "#c8c8c8",
    connectorPending: "#c8c8c8",
    failed: "#e32a20",
};

export default function StatusTrack({ status }) {
    const isFailed = status === "Failed";
    const activeStepIndex = STATUS_STEP_INDEX[status] ?? 0;

    const getStepColor = (index) => {
        if (isFailed && index === 0) {
            return COLORS.failed;
        }

        if (index <= activeStepIndex && !isFailed) {
            return COLORS.completed;
        }

        return index === activeStepIndex + 1 ? COLORS.pending : COLORS.inactive;
    };

    const getConnectorColor = (index) => {
        if (isFailed && index === 0) {
            return COLORS.failed;
        }

        return index <= activeStepIndex && !isFailed
            ? COLORS.completed
            : COLORS.connectorPending;
    };

    return(
        <>
            {/* End----Review content */}
            <div
                style={{
                    paddingLeft: "20px",
                    position: "relative",
                    margin: "10px 0 4px",
                }}
            >
                <div style={{
                    position: "absolute",
                    left: "0",
                    top: "0",
                    width: "2px",
                    height: "100%",
                    backgroundColor: isFailed ? COLORS.failed : COLORS.completed,
                }} />
                <s-grid gridTemplateColumns="100px 120px 120px 100px" gap="base" alignItems="center" justifyContent="start">
                    {STEPS.map((step, index) => (
                        <div
                            key={step}
                            style={{
                                width: "fit-content",
                                height: "fit-content",
                                display: "flex",
                                gap: "18px",
                                flexWrap: "nowrap",
                                alignItems: "center",
                                padding: "4px 0 2px",
                            }}
                        >
                            <div 
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    textAlign: "center",
                                    gap: "4px",
                                }}
                            >
                                <div style={{
                                    width: "7px",
                                    height: "7px",
                                    borderRadius: "100%",
                                    backgroundColor: getStepColor(index),
                                    overflow: "hidden",
                                }}></div>
                                <Text color={getStepColor(index)} as="p">{step}</Text>
                            </div>
                            {index !== STEPS.length - 1 && (
                                <div style={{ width: "50px", height: "2px", backgroundColor: getConnectorColor(index) }}></div>
                            )}
                        </div>
                    ))}
                </s-grid>
            </div>
        </>
    )
}
