import PropTypes from "prop-types"
import CustomSection from "../../../../../../components/essentials/CustomSection"

export default function Contents({
    VALUES,
    handleChange
}) {
    const handleChangeContents = (e) => {
        handleChange({target: "contents", value: e});
    }
    return(
        <CustomSection>
            <s-heading>Contents</s-heading>
            <s-stack paddingBlock="small">
                <s-switch
                    label="Show average rating"
                    onChange={(e) => handleChangeContents({"SHOW_AVERAGE_RATING": e.target.checked})}
                    defaultChecked={VALUES.SHOW_AVERAGE_RATING}
                />
                <s-switch
                    label="Show review count"
                    onChange={(e) => handleChangeContents({"SHOW_REVIEW_COUNT": e.target.checked})}
                    defaultChecked={VALUES.SHOW_REVIEW_COUNT}
                />
                <s-switch
                    label="Show verified badge"
                    onChange={(e) => handleChangeContents({"SHOW_VERIFIED_BADGE": e.target.checked})}
                    defaultChecked={VALUES.SHOW_VERIFIED_BADGE}
                />
            </s-stack>
            <CustomSection padding="small base base base">
                <s-select label="Review source" onChange={(e) => handleChangeContents({"REVIEW_SOURCE": e.currentTarget.value})}>
                    <s-option value="DEMO_REVIEW_SOURCE" defaultSelected={VALUES.REVIEW_SOURCE === "DEMO_REVIEW_SOURCE"}>Qorix demo reviews</s-option>
                    <s-option value="REAL_REVIEW_SOURCE" defaultSelected={VALUES.REVIEW_SOURCE === "REAL_REVIEW_SOURCE"}>Store real reviews</s-option>
                </s-select>
            </CustomSection>
        </CustomSection>
    )
}

Contents.propTypes = {
    VALUES: PropTypes.shape({
        SHOW_AVERAGE_RATING: PropTypes.bool.isRequired,
        SHOW_REVIEW_COUNT: PropTypes.bool.isRequired,
        SHOW_VERIFIED_BADGE: PropTypes.bool.isRequired,
        REVIEW_SOURCE: PropTypes.string.isRequired
    }).isRequired,
    handleChange: PropTypes.func.isRequired
}
