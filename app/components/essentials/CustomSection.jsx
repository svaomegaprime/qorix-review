export default function CustomSection({
    children,
    padding = "base",
    margin = "0px",
    background = "transparent",
    border = "1px solid #e4e4e4ff",
    boxShadow = "0px 1px 3px 0px #e4e4e493",
    borderRadius = "12px",
    overflow = "inherit",
    aspectRatio = "inherit",
    display = "block",
    alignItems = "start",
    justifyContent = "start"
}) {
    return (
        <div style={{ borderRadius: borderRadius, border: border, boxShadow: boxShadow, margin: margin, background: background, overflow: overflow, aspectRatio: aspectRatio, display: display, alignItems: alignItems, justifyContent: justifyContent }}>
            <s-stack padding={padding}>
                {children}
            </s-stack>
        </div>
    )
}