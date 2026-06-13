import { renderPlaceholder, renderTrustBar } from "./previewRenderers"
import { trustBarValuesPropType } from "./previewPropTypes"

export default function ProductPageExample({
    VALUES
}) {
    return (
        <section id="main__product_section" className="trust-preview__product-section">
            <h2 className="trust-preview__heading">Product page example</h2>
            <div className="trust-preview__product">
                {renderPlaceholder("trust-preview__product-image")}
                <div className="trust-preview__product-form">
                    {renderPlaceholder("trust-preview__form-line trust-preview__form-line--title")}
                    {renderPlaceholder("trust-preview__form-line trust-preview__form-line--subtitle")}
                    {renderTrustBar({
                        rating: "4.9",
                        reviews: "(24 reviews)",
                        stars: ["filled", "filled", "filled", "filled", "filled"],
                        VALUES
                    })}
                    {renderPlaceholder("trust-preview__form-line trust-preview__form-line--body")}
                    <div className="trust-preview__price-row">
                        <span className="trust-preview__currency">$</span>
                        {renderPlaceholder("trust-preview__price-line")}
                    </div>
                    <div className="trust-preview__quantity">
                        <span>-</span>
                        <span>1</span>
                        <span>+</span>
                    </div>
                    <div className="trust-preview__button-row">
                        {renderPlaceholder("trust-preview__button-placeholder")}
                        {renderPlaceholder("trust-preview__button-placeholder")}
                    </div>
                </div>
            </div>
        </section>
    )
}

ProductPageExample.propTypes = {
    VALUES: trustBarValuesPropType.isRequired
}
