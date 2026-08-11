class TrustBar {
  constructor({ productId, averageRating, totalReviews }) {
    this.productId = productId;
    this.averageRating = Number(averageRating || 0);
    this.totalReviews = Number(totalReviews || 0);
    this.gradientPrefix = `qorix-trust-bar-star-${Math.random()
      .toString(36)
      .slice(2)}`;

    this.trustBarWidget = this.htmlRender();
  }

  renderStar(index) {
    const fillPercent = Math.max(
      0,
      Math.min(100, (this.averageRating - index) * 100),
    );
    const gradientId = `${this.gradientPrefix}-${index}`;

    return `
      <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="${fillPercent}%" stop-color="var(--qrtb-star-color, #34C759)" />
            <stop offset="${fillPercent}%" stop-color="#E0E0E0" />
          </linearGradient>
        </defs>
        <path d="M9.52 0.855C8.976 -0.285 7.356 -0.285 6.812 0.855L5.144 4.35 1.306 4.855c-1.25.165-1.752 1.706-.837 2.575L3.277 10.1 2.573 13.9c-.23 1.24 1.08 2.193 2.19 1.592L8.166 13.65l3.403 1.848c1.11.601 2.418-.35 2.19-1.592L13.055 10.1l2.808-2.666c.915-.869.414-2.41-.837-2.575L11.186 4.35 9.52 0.855z" fill="url(#${gradientId})" />
      </svg>
    `;
  }

  htmlRender() {
    return `
      <div class="qorix-review-trust-bar ${this.averageRating < 1 ? "hide-trust-widget" : ""}">
        <div class="qorix-review-trust-bar-rating">
          <div class="qorix-review-trust-bar-stars">
            ${Array.from({ length: 5 }, (_, index) => this.renderStar(index)).join("")}
          </div>

          <span class="qorix-review-trust-bar-rating-text">
            <span class="qrtb-show-average-rating">
              ${this.averageRating.toFixed(1)}
            </span>
            <span class="qrtb-show-review-count">
              &nbsp( ${this.totalReviews} <span class="product_card_text"> reviews </span>)
            </span>
          </span>
        </div>

        <div class="qorix-review-trust-bar-divider"></div>

        <div class="qorix-review-trust-bar-verified">
          <svg viewBox="0 0 18 17" fill="var(--qrtb-verified-badge-color)" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 8.5C9.933 8.5 11.5 6.933 11.5 5C11.5 3.067 9.933 1.5 8 1.5C6.067 1.5 4.5 3.067 4.5 5C4.5 6.933 6.067 8.5 8 8.5Z" stroke="var(--qrtb-verified-badge-color)" stroke-width="1.3"/>
            <path d="M1.75 15C2.2 11.9 4.72 10 8 10C8.6 10 9.17 10.07 9.7 10.2" stroke="var(--qrtb-verified-badge-color)" stroke-width="1.3" stroke-linecap="round"/>
            <circle cx="14" cy="12.5" r="4" fill="var(--qrtb-verified-badge-color)"/>
            <path d="M12.3 12.6L13.5 13.8L15.8 11.2" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>

          <p class="qorix-review-trust-bar-verified-label">
            Verified reviews
          </p>
        </div>
      </div>
    `;
  }
}

document.addEventListener("alpine:init", () => {
  window.Alpine.data("TrustBar", (config) => new TrustBar(config));
});
