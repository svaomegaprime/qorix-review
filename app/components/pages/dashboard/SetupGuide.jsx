import { useState, useEffect } from "react";
import ProgressiveBar from "./elements/ProgressiveBar";
import SetupGuideItem from "./elements/SetupGuideItem";

const DEFAULT_ACTIVE_ITEM = "item1"; // This must be a string and should match the item name in SetupGuideItem onToggle callback
const DEFAULT_COMPLETED_STEPS = 0; // This must be a number and between 0 to total steps
const DEFAULT_VERIFYING_ITEM = ""; // This must be a string and should match the item name in SetupGuideItem onClick callback

export default function SetupGuide({ handleUpdate }) {
    // State to manage which item is currently activated
    const [isActivated, setIsActivated] = useState(DEFAULT_ACTIVE_ITEM);
    // State to manage how many steps are completed
    const [completedSteps, setCompletedSteps] = useState(DEFAULT_COMPLETED_STEPS);
    // State to manage which item is currently verifying
    const [isVerifying, setIsVerifying] = useState(DEFAULT_VERIFYING_ITEM);

    // Function to handle item activation
    const handleToggle = (item) => {
        setIsActivated(item);
    }
    
    return (
        <s-section>
            <s-stack gap="base">
                <ProgressiveBar step={completedSteps} totalSteps={3} />
                {/* Step 1 - Enable app embed - Start */}
                <SetupGuideItem
                    title="Install review widget and rating badge"
                    description="Enable the Qorix Reviews block in your theme editor to display reviews and star ratings on your product pages."
                    isActivated={isActivated === "item1"}
                    onToggle={() => handleToggle("item1")}
                    isCompleted={false}
                >
                    <s-grid gridTemplateColumns='auto auto' gap='small' justifyContent='start'>
                        <s-button variant='primary' icon='external'>Enable app embed</s-button>
                        <s-button variant='secondary' loading={isVerifying === "item1"} onClick={() => setIsVerifying("item1")}>
                            Verify Installation
                        </s-button>
                    </s-grid>
                </SetupGuideItem>
                {/* Step 1 - Enable app embed - End */}
                {/* Step 2 - Customize widget - Start */}
                <SetupGuideItem
                    title="Customize the review widget"
                    description="Match the widget to your store's look"
                    isActivated={isActivated === "item2"}
                    onToggle={() => handleToggle("item2")}
                    isCompleted={false}
                >
                    <s-grid gridTemplateColumns='auto auto' gap='small' justifyContent='start'>
                        <s-button variant='primary' icon='external'>Go to widget settings</s-button>
                        <s-button variant='secondary' loading={isVerifying === "item2"} onClick={() => setIsVerifying("item2")}>
                            Mark as done
                        </s-button>
                    </s-grid>
                </SetupGuideItem>
                {/* Step 2 - Customize widget - End */}
                {/* Step 3 - Add store logo and check email styling - Start */}
                <SetupGuideItem
                    title="Add store logo and check email styling"
                    description="Upload your store logo and preview how your review request emails will look to customers."
                    isActivated={isActivated === "item3"}
                    onToggle={() => handleToggle("item3")}
                    isCompleted={false}
                >
                    <s-grid gridTemplateColumns='auto auto' gap='small' justifyContent='start'>
                        <s-button variant='primary' icon='external'>Go to widget settings</s-button>
                        <s-button variant='secondary' loading={isVerifying === "item3"} onClick={() => setIsVerifying("item3")}>
                            Mark as done
                        </s-button>
                    </s-grid>
                </SetupGuideItem>
                {/* Step 3 - Add store logo and check email styling - End */}
            </s-stack>
        </s-section>
    );
}