export default function ProgressiveBar({
    step = 1,
    totalSteps = 3,
    placeholdColor = "#f1f1f1",
    fillColor = "#4caf50",
    visibleHeader = true,
    title = "Quick setup guide"
}) {
    const percentage = (step / totalSteps) * 100;
    const uuid = crypto.randomUUID();
    return (
        <s-stack gap="small">
            {visibleHeader && (
                <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                    <s-heading>{title}</s-heading>
                    <s-paragraph color="subdued">{step} of {totalSteps} completed</s-paragraph>
                </s-stack>
            )}
            <s-stack>
                <div id={`progress-bar-${uuid}`}>
                    <div id={`progress-bar-fill-${uuid}`}></div>
                </div>
            </s-stack>
            <style>
                {`
                    #progress-bar-${uuid} {
                        width: 100%;
                        background-color: ${placeholdColor};
                        border-radius: 5px;
                        height: 5px;
                    }
                    #progress-bar-fill-${uuid} {
                        width: ${percentage}%;
                        height: 100%;
                        background-color: ${fillColor};
                        border-radius: 5px;
                        transition: width 0.5s ease-in-out;
                    }
                `}
            </style>
        </s-stack>
    )
}