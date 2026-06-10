import { useState } from "react";
import CustomSection from "../../../../components/essentials/CustomSection"
import Text from "../../../../components/essentials/elements/Text"

export default function ColorPicker ({ data, onChange, defaultColor }) {
    const [color, setColor] = useState(defaultColor);

    const handleChange = (e) => {
        setColor(e.target.value);
        // onChange(e.target.value);
    }
    return(
        <CustomSection padding="none small small">
            <Text as="h4">{data?.label}</Text>
            <s-grid gridTemplateColumns="33px 1fr" gap="small" alignItems="center">
                <s-clickable command="show" commandFor={data?.key} borderRadius="small" overflow="hidden" border="base" borderColor="strong">
                    <div style={{
                        width: "calc(33px - 10px)",
                        height: "calc(33px - 10px)",
                        background: "#fff",
                        padding: "4px"
                    }}>
                        <div style={{
                            background: color,
                            position: "relative",
                            height: "100%",
                            width: "100%",
                            borderRadius: "4px"
                        }}/>
                    </div>
                </s-clickable>
                <s-popover id={data?.key}>
                    <s-box padding="base">
                        <s-color-picker defaultValue={color} onInput={handleChange} />
                    </s-box>
                </s-popover>
                <s-text-field defaultValue={color} onInput={handleChange} />
            </s-grid>
        </CustomSection>
    )
}