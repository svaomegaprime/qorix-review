import PropTypes from "prop-types"
import ColorPicker from "../../../../components/elements/ColorPicker"
import CustomSection from "../../../../../../components/essentials/CustomSection"

const COLOR_PICKERS_ELEMENTS = [
    {
        key: "STAR_COLOR",
        label: "Star color"
    },
    {
        key: "TEXT_COLOR",
        label: "Text color"
    },
    {
        key: "VERIFIED_BADGE_COLOR",
        label: "Verified badge color"
    }
];

export default function Colors({
    VALUES,
    handleChange
}) {
    const handleChangeColors = (e) => {
        handleChange({target: "colors", value: e});
    }

    return(
        <CustomSection>
            <s-grid gap="base">
                <s-heading>Colors</s-heading>
                {COLOR_PICKERS_ELEMENTS.map((picker) => (
                    <ColorPicker
                        key={picker.key}
                        data={picker}
                        defaultColor={VALUES[picker.key]}
                        onChange={(value) => handleChangeColors({[picker.key]: value})}
                    />
                ))}
            </s-grid>
        </CustomSection>
    )
}

Colors.propTypes = {
    VALUES: PropTypes.shape({
        STAR_COLOR: PropTypes.string.isRequired,
        TEXT_COLOR: PropTypes.string.isRequired,
        VERIFIED_BADGE_COLOR: PropTypes.string.isRequired
    }).isRequired,
    handleChange: PropTypes.func.isRequired
}
