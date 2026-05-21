export default function ProgressiveBar({
    step = 1,
    totalSteps = 3
}) {
    const percentage = (step / totalSteps) * 100;
    return (
        <s-stack gap="small">
            <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                <s-heading>Quick setup guide</s-heading>
                <s-paragraph color="subdued">{step} of {totalSteps} completed</s-paragraph>
            </s-stack>
            <s-stack>
                <div id="progress-bar">
                    <div id="progress-bar-fill"></div>
                </div>
            </s-stack>
            <style>
                {`
                    #progress-bar {
                        width: 100%;
                        background-color: #f1f1f1;
                        border-radius: 5px;
                        height: 5px;
                    }
                    #progress-bar-fill {
                        width: ${percentage}%;
                        height: 100%;
                        background-color: #4caf50;
                        border-radius: 5px;
                        transition: width 0.5s ease-in-out;
                    }
                `}
            </style>
        </s-stack>
    )
}