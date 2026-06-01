import { motion } from "framer-motion";
export default function SetupGuideItem({
    isActivated = false,
    isCompleted = false,
    title = "App status",
    description = "Enable app features by clicking the Activate button below.",
    children,
    onToggle = () => { }
}) {
    const handleToggle = () => {
        onToggle();
    }
    return (
        <s-stack>
            <div style={{ borderRadius: "9px", overflow: "hidden", background: isActivated ? "#F7F7F7" : "transparent" }}>
                <s-clickable onClick={handleToggle}>
                    <s-stack padding="small" direction="inline" gap="small" alignItems="start">
                        <s-icon type={isCompleted ? "check-circle-filled" : "layout-block"} />
                        <div style={{ display: "grid", gap: "5px" }}>
                            <s-text>{title}</s-text>
                            <s-paragraph color="subdued">{description}</s-paragraph>
                        </div>
                    </s-stack>
                </s-clickable>
                <motion.div
                    initial={false}
                    animate={{
                        height: isActivated ? "auto" : 0,
                        opacity: isActivated ? 1 : 0
                    }}
                    style={{ overflow: "hidden" }}
                    transition={{ duration: 0.25 }}
                >
                    <div style={{ padding: "0 15px 15px 45px", background: "#F7F7F7" }}>
                        {children}
                    </div>
                </motion.div>
            </div>
        </s-stack>
    )
}