import PropTypes from "prop-types"
import CustomSection from "../../../../../components/essentials/CustomSection"
import Text from "../../../../../components/essentials/elements/Text"
import Colors from "./sidebar/Colors"
import Contents from "./sidebar/Contents"
import ResetToDefaults from "../../../components/elements/ResetToDefaults"
import Typography from "./sidebar/Typography"
import Visibility from "./sidebar/Visibility"
import CardCodeSnippet from "./sidebar/CardCodeSnippet"

export default function Sidebar ({
    VALUES,
    handleHideAppWindow,
    handleChange,
    handleResetToDefaults,
    customCss,
    handleCssChange,
    isInstalled,
}) {
    const { typography, colors, contents, visibility } = VALUES;

    return(
        <CustomSection
            borderRadius="0"
            boxShadow="none"
            borderLeft="none"
            borderTop="none"
            borderBottom="none"
            padding="none"
            background="#fff"
        >
            <s-grid gridTemplateColumns="auto 1fr" gap="small" padding="small base">
                <s-button variant="tertiary" onClick={handleHideAppWindow}>
                    <s-icon type="arrow-left" />
                </s-button>
                <s-box>
                    <s-stack direction="inline" alignItems="center" gap="small">
                        <Text as="h3">TrustBar</Text>
                        {isInstalled ? (
                            <s-badge tone="success">Installed</s-badge>
                        ) : (
                            <s-badge tone="caution">Not installed</s-badge>
                        )}
                    </s-stack>
                    <s-paragraph color="subdued">
                        Shows average rating + review count.
                    </s-paragraph>
                </s-box>
            </s-grid>
            <s-divider />
            <div 
                style={{
                    height: "calc(100vh - 77px)",
                    overflow: "hidden auto",
                    background: "#fff"
                }}
            >
                {/* Start----Sidebar content */}
                <s-grid gap="base" padding="base">
                    {/* Start----Contents section */}
                    <Contents VALUES={contents} handleChange={handleChange} />
                    {/* End----Contents section */}

                    {/* Start----Colors section */}
                    <Colors VALUES={colors} handleChange={handleChange} />
                    {/* End----Colors section */}

                    {/* Start----Typography section */}
                    <Typography VALUES={typography} handleChange={handleChange} />
                    {/* End----Typography section */}

                    {/* Start----Visibility section */}
                    <Visibility VALUES={visibility} handleChange={handleChange} />
                    {/* End----Visibility section */}

                    {/* Start----CardCodeSnippet section */}
                    <CardCodeSnippet customCss={customCss} handleCssChange={handleCssChange} />
                    {/* End----CardCodeSnippet section */}

                    <ResetToDefaults handleResetToDefaults={handleResetToDefaults} />
                </s-grid>
                {/* End----Sidebar content */}
            </div>
        </CustomSection>
    )
}

Sidebar.propTypes = {
    VALUES: PropTypes.shape({
        typography: PropTypes.shape({
            FONT_SIZE: PropTypes.number.isRequired,
            STAR_SIZE: PropTypes.number.isRequired,
            FONT_WEIGHT: PropTypes.string.isRequired
        }).isRequired,
        colors: PropTypes.shape({
            STAR_COLOR: PropTypes.string.isRequired,
            TEXT_COLOR: PropTypes.string.isRequired,
            VERIFIED_BADGE_COLOR: PropTypes.string.isRequired
        }).isRequired,
        contents: PropTypes.shape({
            SHOW_AVERAGE_RATING: PropTypes.bool.isRequired,
            SHOW_REVIEW_COUNT: PropTypes.bool.isRequired,
            SHOW_VERIFIED_BADGE: PropTypes.bool.isRequired,
            SHOW_VERIFIED_ICON_ONLY: PropTypes.bool.isRequired,
            REVIEW_SOURCE: PropTypes.string.isRequired
        }).isRequired,
        visibility: PropTypes.shape({
            HIDE_IF_NO_REVIEWS: PropTypes.bool.isRequired
        }).isRequired
    }).isRequired,
    handleHideAppWindow: PropTypes.func.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleResetToDefaults: PropTypes.func.isRequired,
    customCss: PropTypes.string,
    handleCssChange: PropTypes.func,
    isInstalled: PropTypes.bool
}
