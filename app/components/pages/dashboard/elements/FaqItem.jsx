import { motion } from "framer-motion"
export default function FaqItem({
    isOpen,
    children,
    title,
    bordered = true,
    onToggle = () => { }
}) {
    const handleToggle = () => {
        onToggle();
    }
    return (
        <s-stack border={bordered ? "base" : "none"} borderWidth={bordered ? "none none base none" : "none"} overflow="hidden">
            <div onClick={handleToggle} style={{ cursor: "pointer", paddingTop: "15px", paddingBottom: "10px" }}>
                <s-grid gridTemplateColumns="1fr auto" gap="base">
                    <s-heading>{title}</s-heading>
                    <s-button variant="tertiary" icon={isOpen ? "chevron-up" : "chevron-down"} />
                </s-grid>
            </div>
            <motion.div
                animate={{
                    height: isOpen ? "auto" : "0px",
                    opacity: isOpen ? 1 : 0,
                }}
                transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                }}
                initial={{
                    height: "0px",
                    opacity: 0,
                }}
            >
                <s-stack paddingBlockEnd="base" paddingInlineEnd="large">
                    {children}
                </s-stack>
            </motion.div>
        </s-stack>
    )
}