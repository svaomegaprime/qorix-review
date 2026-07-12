import PropTypes from "prop-types"

export const trustBarValuesPropType = PropTypes.shape({
    contents: PropTypes.shape({
        SHOW_AVERAGE_RATING: PropTypes.bool.isRequired,
        SHOW_REVIEW_COUNT: PropTypes.bool.isRequired,
        SHOW_VERIFIED_BADGE: PropTypes.bool.isRequired,
        REVIEW_SOURCE: PropTypes.string.isRequired
    }).isRequired,
    colors: PropTypes.shape({
        STAR_COLOR: PropTypes.string.isRequired,
        TEXT_COLOR: PropTypes.string.isRequired,
        VERIFIED_BADGE_COLOR: PropTypes.string.isRequired
    }).isRequired,
    typography: PropTypes.shape({
        FONT_SIZE: PropTypes.number.isRequired,
        STAR_SIZE: PropTypes.number.isRequired,
        FONT_WEIGHT: PropTypes.string.isRequired
    }).isRequired,
    visibility: PropTypes.shape({
        HIDE_IF_NO_REVIEWS: PropTypes.bool.isRequired
    }).isRequired
})
