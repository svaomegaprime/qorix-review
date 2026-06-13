import PropTypes from "prop-types"
import ProductCardExamples from "./preview/ProductCardExamples"
import ProductPageExample from "./preview/ProductPageExample"
import PreviewStyles from "./preview/PreviewStyles"
import { trustBarValuesPropType } from "./preview/previewPropTypes"

export default function PreviewContent({
    VALUES,
    activeDevice
}) {
    return (
        <div className={`trust-preview trust-preview--${activeDevice}`}>
            <div className="trust-preview__page">
                <div>
                    <ProductPageExample VALUES={VALUES} />
                    <ProductCardExamples VALUES={VALUES} />
                </div>
            </div>
            <PreviewStyles />
        </div>
    )
}

PreviewContent.propTypes = {
    VALUES: trustBarValuesPropType.isRequired,
    activeDevice: PropTypes.oneOf(["desktop", "mobile"]).isRequired
}
