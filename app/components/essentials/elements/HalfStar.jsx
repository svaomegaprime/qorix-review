import { useId } from "react";

export default function HalfStar({ width = "100%", color = "#FFB800", emptyColor = "#E5E7EB", size = 20 }) {
    const rawId = useId();
    const gradientId = `half-star-grad-${rawId.replace(/:/g, "")}`;
    const percentStr = typeof width === "number" ? `${width}%` : (String(width).endsWith("%") ? width : `${width}%`);

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 20 20"
            fill="none"
            style={{ display: "block", width: `${size}px`, height: `${size}px` }}
        >
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset={percentStr} stopColor={color} />
                    <stop offset={percentStr} stopColor={emptyColor} />
                </linearGradient>
            </defs>
            <path
                d="M11.1279 4.12299C10.6749 3.17299 9.32485 3.17299 8.87185 4.12299L7.48185 7.03499L4.28285 7.45599C3.24085 7.59399 2.82285 8.87799 3.58585 9.60199L5.92585 11.824L5.33885 14.996C5.14685 16.03 6.23985 16.824 7.16385 16.323L9.99985 14.783L12.8359 16.323C13.7599 16.824 14.8529 16.03 14.6609 14.996L14.0739 11.824L16.4139 9.60199C17.1759 8.87799 16.7589 7.59399 15.7169 7.45599L12.5169 7.03499L11.1279 4.12299Z"
                fill={`url(#${gradientId})`}
            />
        </svg>
    );
}
