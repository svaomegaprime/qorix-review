import PropTypes from "prop-types"
import Range from "../../../../components/elements/Range"
import CustomSection from "../../../../../../components/essentials/CustomSection"

const TYPOGRAPHY_ELEMENTS = [
    {
        key: "FONT_SIZE",
        value: 16
    },
    {
        key: "STAR_SIZE",
        value: 16
    },
    {
        key: "FONT_WEIGHT",
        values: [
            {
                label: "Light",
                value: "LIGHT"
            },
            {
                label: "Medium",
                value: "MEDIUM"
            },
            {
                label: "Bold",
                value: "BOLD"
            }
        ]
    }
];

export default function Typography({
    VALUES,
    handleChange
}) {
    const handleChangeTypography = (e) => {
        handleChange({target: "typography", value: e});
    }

    return(
        <CustomSection>
            <s-grid gap="base">
                <s-heading>Typography</s-heading>
                <CustomSection padding="small">
                    <Range
                        label="Font size"
                        defaultValue={VALUES["FONT_SIZE"]}
                        max={50}
                        onChange={(e) => handleChangeTypography({"FONT_SIZE": Number(e.target.value)})}
                    />
                </CustomSection>
                <CustomSection padding="small">
                    <Range
                        label="Star size"
                        defaultValue={VALUES["STAR_SIZE"]}
                        max={50}
                        onChange={(e) => handleChangeTypography({"STAR_SIZE": Number(e.target.value)})}
                    />
                </CustomSection>
                <CustomSection padding="small">
                    <s-select
                        label="Font weight"
                        defaultValue={VALUES["FONT_WEIGHT"]}
                        onChange={(e) => handleChangeTypography({"FONT_WEIGHT": e.currentTarget.value})}
                    >
                        {TYPOGRAPHY_ELEMENTS.find((item) => item.key === "FONT_WEIGHT")?.values.map((value, key) => (
                            <s-option key={key} value={value?.value} defaultSelected={value?.value === VALUES["FONT_WEIGHT"]}>{value?.label}</s-option>
                        ))}
                    </s-select>
                </CustomSection>
            </s-grid>
        </CustomSection>
    )
}

Typography.propTypes = {
    VALUES: PropTypes.shape({
        FONT_SIZE: PropTypes.number.isRequired,
        STAR_SIZE: PropTypes.number.isRequired,
        FONT_WEIGHT: PropTypes.string.isRequired
    }).isRequired,
    handleChange: PropTypes.func.isRequired
}
