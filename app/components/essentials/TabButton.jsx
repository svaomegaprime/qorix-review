export default function TabButton({
    children,
    isActive,
    onClick
}) {
    return (
        <div onClick={onClick} style={{ transition: "all 0.3s ease", background: isActive ? "#F0F0F0" : "#fff", cursor: "pointer", padding: "6px", fontSize: "14px", textAlign: "center", boxShadow: isActive ? "0px 1px 0px 1px #e4e4e4ff" : "none", borderRadius: "7px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            {children}
        </div>
    )
}