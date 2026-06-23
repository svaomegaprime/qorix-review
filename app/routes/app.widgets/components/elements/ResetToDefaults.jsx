import PropTypes from "prop-types"

export default function ResetToDefaults({
    handleResetToDefaults
}) {
    return(
        <s-stack alignItems="center" padding="base">
            <s-button icon="reset" commandFor="reset_confirmation" command="--show">Reset to defaults</s-button>
            <s-popover id="reset_confirmation">
                <s-stack padding="base" gap="small" maxInlineSize="180px">
                    <s-heading>Are you sure you want to reset to defaults?</s-heading>
                    <s-grid gridTemplateColumns="auto auto" gap="base" alignItems="center" justifyContent="end">
                        <s-button commandFor="reset_confirmation" command="--hide">Cancel</s-button>
                        <s-button
                            variant="primary"
                            tone="critical"
                            commandFor="reset_confirmation"
                            command="--hide"
                            onClick={handleResetToDefaults}
                        >
                            Reset
                        </s-button>
                    </s-grid>
                </s-stack>
            </s-popover>
        </s-stack>
    )
}

ResetToDefaults.propTypes = {
    handleResetToDefaults: PropTypes.func.isRequired
}
