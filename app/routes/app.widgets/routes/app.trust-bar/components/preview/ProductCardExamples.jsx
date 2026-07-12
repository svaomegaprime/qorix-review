import { PRODUCT_CARDS } from "./previewData"
import { renderProductCard } from "./previewRenderers"
import { trustBarValuesPropType } from "./previewPropTypes"

export default function ProductCardExamples({
    VALUES
}) {
    return (
        <section id="main__collection_section" className="trust-preview__collection-section">
            <h2 className="trust-preview__heading">Product card examples</h2>
            <div className="trust-preview__cards">
                {PRODUCT_CARDS.map((card, index) => renderProductCard(card, index, VALUES))}
            </div>
        </section>
    )
}

ProductCardExamples.propTypes = {
    VALUES: trustBarValuesPropType.isRequired
}
