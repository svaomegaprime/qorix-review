const DEFAULT_BORDER_STYLES = {
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#e4e4e4ff",
};

export default function CustomSection({
    children,
    padding = "base",
    margin = "0px",
    background = "transparent",
    border,
    borderTop,
    borderRight,
    borderBottom,
    borderLeft,
    borderBlock,
    borderBlockStart,
    borderBlockEnd,
    borderInline,
    borderInlineStart,
    borderInlineEnd,
    borderColor,
    borderStyle,
    borderWidth,
    boxShadow = "0px 1px 3px 0px #e4e4e493",
    borderRadius = "12px",
    borderTopLeftRadius,
    borderTopRightRadius,
    borderBottomRightRadius,
    borderBottomLeftRadius,
    overflow = "inherit",
    aspectRatio = "inherit",
    display = "block",
    alignItems = "start",
    justifyContent = "start",
}) {
    const borderStyles = {
        ...DEFAULT_BORDER_STYLES,
        ...(border !== undefined ? { border } : {}),
        ...(borderTop !== undefined ? { borderTop } : {}),
        ...(borderRight !== undefined ? { borderRight } : {}),
        ...(borderBottom !== undefined ? { borderBottom } : {}),
        ...(borderLeft !== undefined ? { borderLeft } : {}),
        ...(borderBlock !== undefined ? { borderBlock } : {}),
        ...(borderBlockStart !== undefined ? { borderBlockStart } : {}),
        ...(borderBlockEnd !== undefined ? { borderBlockEnd } : {}),
        ...(borderInline !== undefined ? { borderInline } : {}),
        ...(borderInlineStart !== undefined ? { borderInlineStart } : {}),
        ...(borderInlineEnd !== undefined ? { borderInlineEnd } : {}),
        ...(borderColor !== undefined ? { borderColor } : {}),
        ...(borderStyle !== undefined ? { borderStyle } : {}),
        ...(borderWidth !== undefined ? { borderWidth } : {}),
        ...(borderTopLeftRadius !== undefined ? { borderTopLeftRadius } : {}),
        ...(borderTopRightRadius !== undefined ? { borderTopRightRadius } : {}),
        ...(borderBottomRightRadius !== undefined ? { borderBottomRightRadius } : {}),
        ...(borderBottomLeftRadius !== undefined ? { borderBottomLeftRadius } : {}),
    };

    return (
        <div style={{ borderRadius: borderRadius, ...borderStyles, boxShadow: boxShadow, margin: margin, background: background, overflow: overflow, aspectRatio: aspectRatio, display: display, alignItems: alignItems, justifyContent: justifyContent }}>
            <s-stack padding={padding}>
                {children}
            </s-stack>
        </div>
    )
}
