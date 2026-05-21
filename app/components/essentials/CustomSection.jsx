export default function CustomSection({
    children,
    padding = "base",
    margin = "0px",
    background = "transparent"
}) {
    return (
        <div style={{ borderRadius: "12px", border: "1px solid #e4e4e4ff", boxShadow: "0px 1px 3px 0px #e4e4e493", margin: margin, background: background }}>
            <s-stack padding={padding}>
                {children}
            </s-stack>
        </div>
    )
}