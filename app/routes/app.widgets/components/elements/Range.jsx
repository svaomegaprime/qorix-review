import { useState } from "react";

export default function Range({
    unit = "px",
    min = 0,
    max = 100,
    defaultValue = 0,
    onChange,
    label = ""
}) {
    const [rangeValue, setRangeValue] = useState(defaultValue);
    const handleRangeChange = (e) => {
        setRangeValue(e.target.value);
        onChange(e);
    }
    const className = label !== "" ? label.toLowerCase().replace(" ", "-") : `custom-range-${Math.random().toString(36).substring(2, 9)}`;
    return (
        <div style={{ display: "grid", gap: "3px" }}>
            {label !== "" && <s-paragraph>{label}</s-paragraph>}
            <s-grid gridTemplateColumns="1fr 40px" gap="small" alignItems="center">
                <input className={className} type="range" min={min} max={max} defaultValue={rangeValue} onChange={handleRangeChange} />
                <style>
                    {`
                        .${className} {
                            -webkit-appearance: none;
                            width: 100%;
                            height: 4px;
                            cursor: pointer;
                            background: #616161;
                            border-radius: 4px;
                        }

                        .${className}::-webkit-slider-thumb {
                            -webkit-appearance: none;
                            height: 18px;
                            width: 18px;
                            border-radius: 50%;
                            background: #fff;
                            cursor: grab;
                            border: 2px solid #616161;
                        }

                        .${className}::-webkit-slider-thumb:active {
                            cursor: grabbing;
                        }
                    `}
                </style>
                <s-stack direction="inline" justifyContent="end">
                    <s-text>{rangeValue}{unit}</s-text>
                </s-stack>
            </s-grid>
        </div>
    )
}