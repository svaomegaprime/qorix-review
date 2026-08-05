class TrustBar {
  constructor({ productId, averageRating, totalReviews }) {
    this.productId = productId;
    this.averageRating = Number(averageRating || 0);
    this.totalReviews = Number(totalReviews || 0);

    this.trustBarWidget = this.htmlRender();
  }

  htmlRender() {
    return `
      <div class="qorix-review-trust-bar ${this.averageRating < 1 ? "hide-trust-widget" : ""}">
        <div class="qorix-review-trust-bar-rating">
          <div class="qorix-review-trust-bar-stars">
            ${Array.from({ length: Math.floor(this.averageRating) })
              .map(
                () => `
                  <svg class="fill-svg" width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.51964 0.855C8.97604 -0.285 7.35604 -0.285 6.81244 0.855L5.14444 4.3494L1.30564 4.8546C0.0552353 5.0202 -0.446365 6.561 0.469235 7.4298L3.27724 10.0962L2.57284 13.9026C2.34244 15.1434 3.65404 16.0962 4.76284 15.495L8.16604 13.647L11.5692 15.495C12.678 16.0962 13.9896 15.1434 13.7592 13.9026L13.0548 10.0962L15.8628 7.4298C16.7772 6.561 16.2768 5.0202 15.0264 4.8546L11.1864 4.3494L9.51964 0.855Z"/>
                  </svg>
                `,
              )
              .join("")}
          </div>

          <span class="qorix-review-trust-bar-rating-text">
            <span class="qrtb-show-average-rating">
              ${this.averageRating.toFixed(1)}
            </span>
            <span class="qrtb-show-review-count">
              &nbsp(${this.totalReviews} <span class="product_card_text"> reviews </span>)
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

          <span class="qorix-review-trust-bar-verified-label">
            Verified reviews
          </span>
        </div>
      </div>
    `;
  }
}

document.addEventListener("alpine:init", () => {
  Alpine.data("TrustBar", (config) => new TrustBar(config));
});

// class TrustBar {
//   constructor(productId) {
//     this.productId = productId;
//     this.trustBarWidget = this.getReview();
//   }
//   htmlRender(data) {
//     const html = `
//         <div class="qorix-review-trust-bar ${data.averageRating < 1 ? "hide-trust-widget" : ""}" >
//           <div class="qorix-review-trust-bar-rating">
//             <div class="qorix-review-trust-bar-stars">
//               ${Array.from({ length: data.averageRating || 0 })
//                 .map(
//                   () => `
//                           <svg class="fill-svg" width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
//                             <path d="M9.51964 0.855C8.97604 -0.285 7.35604 -0.285 6.81244 0.855L5.14444 4.3494L1.30564 4.8546C0.0552353 5.0202 -0.446365 6.561 0.469235 7.4298L3.27724 10.0962L2.57284 13.9026C2.34244 15.1434 3.65404 16.0962 4.76284 15.495L8.16604 13.647L11.5692 15.495C12.678 16.0962 13.9896 15.1434 13.7592 13.9026L13.0548 10.0962L15.8628 7.4298C16.7772 6.561 16.2768 5.0202 15.0264 4.8546L11.1864 4.3494L9.51964 0.855Z" />
//                           </svg>
//                         `,
//                 )
//                 .join("")}
//             </div>
//             <span class="qorix-review-trust-bar-rating-text"><span class="qrtb-show-average-rating">${Number(data?.averageRating || 0).toFixed(1)} </span> <span class="qrtb-show-review-count"> (${data?.totalReviews || 0} reviews)</span></span>
//           </div>

//           <div class="qorix-review-trust-bar-divider"></div>

//           <div class="qorix-review-trust-bar-verified">
//             <svg viewBox="0 0 18 17" fill="var(--qrtb-verified-badge-color)" xmlns="http://www.w3.org/2000/svg">
//               <path d="M8 8.5C9.933 8.5 11.5 6.933 11.5 5C11.5 3.067 9.933 1.5 8 1.5C6.067 1.5 4.5 3.067 4.5 5C4.5 6.933 6.067 8.5 8 8.5Z" stroke="var(--qrtb-verified-badge-color)" stroke-width="1.3"/>
//               <path d="M1.75 15C2.2 11.9 4.72 10 8 10C8.6 10 9.17 10.07 9.7 10.2" stroke="var(--qrtb-verified-badge-color)" stroke-width="1.3" stroke-linecap="round"/>
//               <circle cx="14" cy="12.5" r="4" fill="var(--qrtb-verified-badge-color)"/>
//               <path d="M12.3 12.6L13.5 13.8L15.8 11.2" stroke="white" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
//             </svg>
//           <span class="qorix-review-trust-bar-verified-label">Verified reviews</span>
//           </div>

//         </div>
//     `;
//     return html;
//   }
//   async getReview() {
//     // apps/review/productId/
//     try {
//       const singleReviewJson = await fetch(
//         `/apps/qorix-review/single-review/${this.productId}`,
//         {
//           method: "GET",
//         },
//       );
//       const singleReview = await singleReviewJson.json();
//       console.log("singleReview==========>>>>>", singleReview);
//       return this.htmlRender(singleReview.data);
//     } catch (error) {
//       console.log(error);
//     }
//   }
// }

// // window.TrustBar = () => new TrustBar();

// document.addEventListener("alpine:init", () => {
//   window.Alpine.data("TrustBar", (productId) => new TrustBar(productId));
// });
