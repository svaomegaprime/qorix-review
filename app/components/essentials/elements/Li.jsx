export default function Li({
    listType = true,
    children,
    style,
    className,
    ...props
}) {
    return (
        <li style={{ margin: "0", marginRight: listType ? "6px" : "0", listStyle: listType ? "disc" : "none", ...style, color: "#303030", padding: "0" }} className={className} {...props}>
            {children}
        </li>
    )
}