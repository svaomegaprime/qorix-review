import Star from "../../../../components/icons/Star"
import VerifiedUser from "../../../../components/icons/VerifiedUser"
import { EMPTY_STAR_COLOR } from "./previewData"

const FONT_WEIGHTS = {
    LIGHT: 300,
    MEDIUM: 500,
    BOLD: 700
};

function getReviewCount(reviews) {
    const count = String(reviews).match(/\d+/)?.[0];

    return Number(count ?? 0);
}

function getTextStyle(VALUES) {
    const { colors, typography } = VALUES;

    return {
        color: colors.TEXT_COLOR,
        fontSize: `${typography.FONT_SIZE}px`,
        fontWeight: FONT_WEIGHTS[typography.FONT_WEIGHT] ?? FONT_WEIGHTS.MEDIUM
    };
}

function getRatingText({ rating, reviews, VALUES }) {
    const { contents } = VALUES;
    const textParts = [];

    if (contents.SHOW_AVERAGE_RATING) {
        textParts.push(rating);
    }

    if (contents.SHOW_REVIEW_COUNT) {
        textParts.push(reviews);
    }

    return textParts.join(" ");
}

export function renderPlaceholder(className = "", style) {
    return <div className={`trust-preview__placeholder ${className}`} style={style} />;
}

export function renderRatingStars(stars, VALUES) {
    const starSize = VALUES.typography.STAR_SIZE;
    const starStyle = {
        display: "inline-flex",
        width: `${(starSize * 17) / 16}px`,
        height: `${starSize}px`
    };

    return (
        <div className="trust-preview__stars" aria-hidden="true">
            {stars.map((star, index) => (
                <span key={`${star}-${index}`} style={starStyle}>
                    <Star type={star} fill={star === "empty" ? EMPTY_STAR_COLOR : VALUES.colors.STAR_COLOR} />
                </span>
            ))}
        </div>
    );
}

export function renderTrustBar({ rating = "4.9", reviews = "(24 reviews)", stars, VALUES }) {
    const { contents, colors, visibility } = VALUES;
    const ratingText = getRatingText({ rating, reviews, VALUES });
    const showVerifiedBadge = contents.SHOW_VERIFIED_BADGE;
    const showDivider = ratingText !== "" && showVerifiedBadge;
    const textStyle = getTextStyle(VALUES);

    if (visibility.HIDE_IF_NO_REVIEWS && getReviewCount(reviews) === 0) {
        return null;
    }

    return (
        <div className="trust-preview__rating-row">
            {renderRatingStars(stars, VALUES)}
            {ratingText !== "" && <span className="trust-preview__rating-text" style={textStyle}>{ratingText}</span>}
            {showDivider && <span className="trust-preview__divider" />}
            {showVerifiedBadge && (
                <span className="trust-preview__verified" style={textStyle}>
                    <VerifiedUser color={colors.VERIFIED_BADGE_COLOR} />
                    <span>Verified reviews</span>
                </span>
            )}
        </div>
    );
}

export function renderProductCard(card, index, VALUES) {
    const { contents, colors, visibility } = VALUES;
    const ratingText = getRatingText({ rating: card.rating, reviews: card.reviews, VALUES });
    const textStyle = getTextStyle(VALUES);

    if (visibility.HIDE_IF_NO_REVIEWS && getReviewCount(card.reviews) === 0) {
        return null;
    }

    return (
        <div className="trust-preview__card" key={`${card.rating}-${index}`}>
            {renderPlaceholder("trust-preview__card-image")}
            <div className="trust-preview__card-rating">
                {renderRatingStars(card.stars, VALUES)}
                {ratingText !== "" && <span className="trust-preview__card-rating-text" style={textStyle}>{ratingText}</span>}
                {contents.SHOW_VERIFIED_BADGE && <VerifiedUser color={colors.VERIFIED_BADGE_COLOR} />}
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
