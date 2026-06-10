import Star from "../../../components/icons/Star"
import VerifiedUser from "../../../components/icons/VerifiedUser"

const STAR_COLOR = "#FF9500";
const EMPTY_STAR_COLOR = "#B8B8B8";

const PRODUCT_CARDS = [
    {
        rating: "4.9",
        reviews: "(24)",
        stars: ["filled", "filled", "filled", "filled", "half"],
        lineWidth: "102px"
    },
    {
        rating: "4.9",
        reviews: "(24)",
        stars: ["filled", "filled", "filled", "filled", "half"],
        lineWidth: "102px"
    },
    {
        rating: "4.9",
        reviews: "(24)",
        stars: ["filled", "filled", "filled", "filled", "empty"],
        lineWidth: "102px"
    },
    {
        rating: "5.0",
        reviews: "(24)",
        stars: ["filled", "filled", "filled", "filled", "filled"],
        lineWidth: "102px"
    }
];

function renderPlaceholder(className = "", style) {
    return <div className={`trust-preview__placeholder ${className}`} style={style} />;
}

function renderRatingStars(stars) {
    return (
        <div className="trust-preview__stars" aria-hidden="true">
            {stars.map((star, index) => (
                <Star key={`${star}-${index}`} type={star} fill={star === "empty" ? EMPTY_STAR_COLOR : STAR_COLOR} />
            ))}
        </div>
    );
}

function renderTrustBar({ rating = "4.9", reviews = "(24 reviews)", stars }) {
    return (
        <div className="trust-preview__rating-row">
            {renderRatingStars(stars)}
            <span className="trust-preview__rating-text">{rating} {reviews}</span>
            <span className="trust-preview__divider" />
            <span className="trust-preview__verified">
                <VerifiedUser color="#088728" />
                <span>Verified reviews</span>
            </span>
        </div>
    );
}

function renderProductCard(card, index) {
    return (
        <div className="trust-preview__card" key={`${card.rating}-${index}`}>
            {renderPlaceholder("trust-preview__card-image")}
            <div className="trust-preview__card-rating">
                {renderRatingStars(card.stars)}
                <span className="trust-preview__card-rating-text">{card.rating} {card.reviews}</span>
                <VerifiedUser color="#088728" />
            </div>
            {renderPlaceholder("trust-preview__card-line trust-preview__card-line--wide")}
            {renderPlaceholder("trust-preview__card-line", { width: card.lineWidth })}
            <div className="trust-preview__card-variants">
                {renderPlaceholder("trust-preview__card-variant")}
                {renderPlaceholder("trust-preview__card-variant")}
                {renderPlaceholder("trust-preview__card-variant")}
                {renderPlaceholder("trust-preview__card-variant")}
                {renderPlaceholder("trust-preview__card-variant")}
            </div>
        </div>
    );
}

export default function PreviewContent() {
    return (
        <div className="trust-preview">
            <div className="trust-preview__page">
                {/* Start----Design */}
                <div>
                    {/* Start----Product page */}
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
                                    stars: ["filled", "filled", "filled", "filled", "filled"]
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
                    {/* End----Product page */}

                    {/* Start----Collection */}
                    <section id="main__collection_section" className="trust-preview__collection-section">
                        <h2 className="trust-preview__heading">Product card examples</h2>
                        <div className="trust-preview__cards">
                            {PRODUCT_CARDS.map((card, index) => (
                                renderProductCard(card, index)
                            ))}
                        </div>
                    </section>
                    {/* End----Collection */}
                </div>
                {/* End----Design */}
            </div>
            <style>
                {`
                    .trust-preview {
                        height: calc(100vh - 76px);
                        overflow: auto;
                        background: #b5b5b5;
                        padding: 50px;
                        box-sizing: border-box;
                    }

                    .trust-preview__page {
                        min-width: 868px;
                        min-height: calc(100vh - 176px);
                        background: #fff;
                        padding: 40px 45px 90px;
                        box-sizing: border-box;
                    }

                    .trust-preview__heading {
                        margin: 0;
                        color: #202223;
                        font-size: 20px;
                        font-weight: 500;
                        line-height: 25px;
                    }

                    .trust-preview__product {
                        display: grid;
                        grid-template-columns: auto 1fr;
                        gap: 20px;
                        align-items: stretch;
                        margin-top: 18px;
                    }

                    .trust-preview__placeholder {
                        background: #e7e7e7;
                        border-radius: 999px;
                    }

                    .trust-preview__product-image {
                        width: auto;
                        height: 100%;
                        aspect-ratio: 1 / 0.9;
                        border-radius: 7px;
                    }

                    .trust-preview__product-form {
                        padding-top: 0;
                    }

                    .trust-preview__form-line {
                        height: 24px;
                    }

                    .trust-preview__form-line--title {
                        max-width: 300px;
                        width: 100%;
                        margin-bottom: 12px;
                    }

                    .trust-preview__form-line--subtitle {
                        max-width: 220px;
                        width: 100%;
                        margin-bottom: 16px;
                    }

                    .trust-preview__form-line--body {
                        max-width: 220px;
                        width: 100%;
                        margin-bottom: 16px;
                    }

                    .trust-preview__rating-row,
                    .trust-preview__card-rating {
                        display: flex;
                        align-items: center;
                    }

                    .trust-preview__rating-row {
                        gap: 8px;
                        margin-bottom: 18px;
                    }

                    .trust-preview__stars {
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        flex: none;
                    }

                    .trust-preview__rating-text,
                    .trust-preview__verified,
                    .trust-preview__price-row,
                    .trust-preview__card-rating-text {
                        color: #3f3f3f;
                        line-height: 1;
                        font-size: 16px;
                        font-weight: 400;
                    }

                    .trust-preview__divider {
                        width: 1px;
                        height: 24px;
                        background: #d7d7d7;
                        margin-right: 2px;
                    }

                    .trust-preview__verified {
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        color: #6a6a6a;
                    }

                    .trust-preview__price-row {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin-bottom: 15px;
                    }

                    .trust-preview__currency{
                        font-size: 16px;
                        line-height: 1;
                    }

                    .trust-preview__price-line {
                        width: 70px;
                        height: 24px;
                    }

                    .trust-preview__quantity {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        align-items: center;
                        width: 120px;
                        height: 40px;
                        margin-top: 22px;
                        margin-bottom: 22px;
                        border: 1px solid #dcdcdc;
                        border-radius: 3px;
                        color: #4f4f4f;
                        font-size: 16px;
                        line-height: 1;
                        text-align: center;
                        box-sizing: border-box;
                    }

                    .trust-preview__button-row {
                        display: flex;
                        gap: 15px;
                    }

                    .trust-preview__button-placeholder {
                        width: 200px;
                        height: 40px;
                    }

                    .trust-preview__collection-section {
                        margin-top: 68px;
                    }

                    .trust-preview__cards {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 20px;
                        margin-top: 20px;
                    }

                    .trust-preview__card {
                        width: 100%;
                        height: auto;
                        aspect-ratio: 188 / 232;
                        padding: 10px;
                        border: 1px solid #efefef;
                        border-radius: 10px;
                        box-sizing: border-box;
                        overflow: hidden;
                    }

                    .trust-preview__card-image {
                        width: 100%;
                        height: auto;
                        aspect-ratio: 1 / .75;
                        border-radius: 7px;
                    }

                    .trust-preview__card-line {
                        width: 100%;
                        height: 24px;
                    }

                    .trust-preview__card-line--wide {
                        margin-top: 15px;
                        margin-bottom: 15px;
                    }

                    .trust-preview__card-variants {
                        display: grid;
                        grid-template-columns: repeat(5, 24px);
                        gap: 10px;
                        margin-top: 12px;
                    }
                    
                    .trust-preview__card-variant {
                        width: 100%;
                        height: auto;
                        aspect-ratio: 1 / 1;
                        border-radius: 100%;
                    }

                    .trust-preview__card-rating {
                        gap: 7px;
                        margin-top: 12px;
                    }
                `}
            </style>
        </div>
    )
}
