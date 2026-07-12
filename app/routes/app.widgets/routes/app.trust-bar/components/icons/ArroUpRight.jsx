export default function ArrowUpRight({
    size = "16px",
    fill = "currentColor"
}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width={size} height={size}>
            <path fill={fill} fill-rule="evenodd" d="M3.228 12.772a.78.78 0 0 1 0-1.101l7.113-7.114h-3.993a.778.778 0 1 1 0-1.557h5.873c.207 0 .405.082.55.228a.78.78 0 0 1 .229.55v5.874a.78.78 0 1 1-1.558-.001v-3.992l-7.113 7.113a.777.777 0 0 1-1.1 0Z">
            </path>
        </svg>
    )
}