import PropTypes from "prop-types"
import CustomSection from "../../../../../../components/essentials/CustomSection"

export default function Visibility({
    VALUES,
    handleChange
}) {
    const handleChangeVisibility = (e) => {
        handleChange({target: "visibility", value: e});
    }

    return(
        <CustomSection padding="small base">
            <s-heading>Visibility</s-heading>
            <s-switch
                label="Hide if no reviews"
                onChange={(e) => handleChangeVisibility({"HIDE_IF_NO_REVIEWS": e.target.checked})}
                defaultChecked={VALUES.HIDE_IF_NO_REVIEWS}
            />
        </CustomSection>
    )
}

Visibility.propTypes = {
    VALUES: PropTypes.shape({
        HIDE_IF_NO_REVIEWS: PropTypes.bool.isRequired
    }).isRequired,
    handleChange: PropTypes.func.isRequired
}
