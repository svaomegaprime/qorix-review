import React, { useState } from "react";
import ReaviewHeader from "../../../components/elements/WidgetsHeader";
import reviewHubReviews from "../data/reviewHubReviews.json";
import ReviewSummary, {
  StarSVG,
} from "../../../components/elements/ReviewSummary";

import LodeMoreButton from "../../../components/elements/LodeMoreButton";

export default function ReviewHubWidget({ settings, activeDevice }) {
  // layout: "3 column grid",
  // filterSorting: "Filter & sorting both",
  // reviewsPerPage: "9 reviews",
  // reviewStats: "Show review count & verified badge",

   
  const {
    showStarDistribution,
    showReviewerName,
    showReviewTimer,
    showVerifiedBadge,
    showMediaAsset,
    showShareOption,
    showAppreciationOption,
    layout,
    filterSorting,
    reviewsPerPage,
    reviewStats,
  } = settings || {};

  const colors = settings?.colors || {};
  const {
    STAR_COLOR = "#34C759",
    TEXT_COLOR = "#1A1A1A",
    VERIFIED_BADGE_COLOR = "#1D9E75",
    Card_Background_Color = "#FFFFFF",
    FILTER_CHIP_COLOR = "#108848",
    Border_Color = "#F0F0F0",
    FILTER_CHIP_COLOR_STAR_COLOR = "#ffffff",
  } = colors;

  const [activeRating, setActiveRating] = useState(4);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterign, setIsFilterign] = useState(false); // Kept true initially to showcase the custom dropdown overlay like the image
  const [selectedSort, setSelectedSort] = useState("Most recent");

  const ratings = ["All", 1, 2, 3, 4, 5];
  const sortOptions = [
    "Most recent",
    "Highest rating",
    "Lowest rating",
    "Only pictures",
    "Only Videos",
    "Most helpful",
  ];
  const visibleReviewCount =
    Number.parseInt(String(reviewsPerPage || ""), 10) || reviewHubReviews.length;
  const visibleReviews = reviewHubReviews.slice(0, visibleReviewCount);

  return (
    <>
      <style>{`
        :root {
          --qr-white: #ffffff;
          --qr-bg: #f9f9f9;
          --qr-green: #15b046;
          --qr-text-primary: #1a1a1a;
          --qr-text-secondary: #2b2b2b;
          --qr-text-muted: #666666;
          --qr-border: #eef0f2;
          --qr-card-bg: #ffffff;
          --qr-card-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          --qr-badge-bg: #f3f4f6;
          --qr-card-radius: 16px;
          --qr-img-radius: 12px;
          --tb-bg: #ffffff;
          --tb-green: #15b046;
          --tb-text-main: #1a1a1a;
          --tb-text-muted: #555555;
          --tb-border-color: #e2e8f0;
          --tb-border-radius: 8px;
        }

       .qr-reviews-container{
          background:#B5B5B5 ;
        padding:70px;
       overflow: auto;
       height: 760px;

        }

     
   .qr-reviews-section {
  max-width: ${activeDevice === "mobile" ? "390px" : "1400px"};
  padding: ${activeDevice === "mobile" ? "20px" : "100px"};
  background: #fff;
  margin: 0 auto;
overflow: auto;

  border-radius: ${activeDevice === "mobile" ? "40px" : "0"};
}



        .qr-reviews-grid {
          display: grid;
          padding: 40px 0;
          grid-template-columns:  repeat(${activeDevice === "mobile" ? 1 : layout?.slice(0, 2)},  1fr);
          gap: 24px;
        }

        /* --- Exact Match Card Styling from image_57bf9f.png --- */
        .qr-review-card {
          background: ${Card_Background_Color};
          border: 1px solid ${Border_Color};
          border-radius: var(--qr-card-radius);
          padding: 24px;
          box-shadow: var(--qr-card-shadow);
          display: flex;
          flex-direction: column;
          gap: 14px;
          // max-width: 440px; /* Optional standard limit */
        }

        .qr-reviewer-info {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .qr-reviewer-avatar {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          object-fit: cover;
          background: #f0e2d5;
        }

        .qr-reviewer-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .qr-reviewer-name-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .qr-reviewer-name {
          font-size: 16px;
          font-weight: 600;
          color: ${TEXT_COLOR};
          letter-spacing: -0.01em;
        }

        .qr-verified-check {
          display: inline-flex;
          align-items: center;
          color: var(--qr-green);
        }

        .qr-reviewer-time {
          font-size: 14px;
          color: ${TEXT_COLOR};
        }

        .qr-card-stars {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .qr-review-text {
          font-size: 15px;
          color:${TEXT_COLOR};
          line-height: 1.45;
          font-weight: 400;
        }

        /* Gallery/Images Grid Layout */
        .qr-review-gallery {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 2px;
          min-height: 156px;
        }

        .qr-review-gallery.single-media {
          grid-template-columns: 1fr;
        }

        .qr-gallery-item {
          position: relative;
          height: 156px;
          border-radius: var(--qr-img-radius);
          overflow: hidden;
          background: #f4f4f4;
        }

        .qr-gallery-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .qr-gallery-play {
          position: absolute;
          right: 10px;
          bottom: 10px;
          width: 26px;
          height: 27px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: rgba(255, 255, 255, 0.92);
          color: #333333;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          line-height: 1;
          padding-left: 2px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.14);
        }

        .qr-gallery-overlay {
          position: absolute;
          right: 8px;
          bottom: 8px;
          background: rgba(0, 0, 0, 0.55);
          color: var(--qr-white);
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 22px;
          padding: 0 8px;
          border-radius: 7px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        /* Product Tag Badge */
        .qr-product-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--qr-badge-bg);
          padding: 8px 14px;
          border-radius: 10px;
          align-self: flex-start;
          margin-top: 4px;
        }

        .qr-product-icon {
          font-size: 15px;
          display: inline-flex;
          align-items: center;
        }

        .qr-product-name {
          font-size: 14px;
          font-weight: 500;
          color: #2c3e50;
        }

        /* Footer Action Buttons */
        .qr-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 6px;
          margin-top: auto;
        }

        .qr-helpful-btn, .qr-share-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--qr-font-body);
          font-size: 13px;
          font-weight: 500;
          color: #333333;
          background: var(--qr-white);
          border: 1px solid #dcdcdc;
          border-radius: 10px;
          cursor: pointer;
          padding: 8px 16px;
          transition: background 0.15s;
        }

        .qr-helpful-btn:hover, .qr-share-btn:hover {
          background: #f7f7f7;
        }

        // --------------filtering------------ //
        .tb-container {
          font-family: var(--tb-font);
          background: var(--tb-bg);
          padding: 50px 0px ;
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          border-bottom: 1px solid #f0f0f0;
        }

        /* Top row holding generic filter button and right-side sorter */
        .tb-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .tb-filter-main-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          border: 1px solid #dcdcdc;
          border-radius: var(--tb-border-radius);
          padding: 8px 14px;
          font-size: 14px;
          color: #333333;
          font-weight: 500;
          cursor: pointer;
        }

        /* Sort dropdown wrapper */
        .tb-sort-wrapper {
          position: relative;
        }

        .tb-sort-trigger {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #ffffff;
          border: 1px solid #dcdcdc;
          border-radius: var(--tb-border-radius);
          padding: 8px 12px;
          font-size: 14px;
          color: #333333;
          cursor: pointer;
        }

        .tb-sort-trigger span {
          font-weight: 600;
          color: #222222;
        }

        /* Custom Dropdown Menu overlay from image_4cd9ff.png */
        .tb-sort-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 4px);
          background: #ffffff;
          border: 1px solid #e8e8e8;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          width: 160px;
          z-index: 50;
          overflow: hidden;
          padding: 4px 0;
        }

        .tb-sort-item {
          width: 100%;
          padding: 10px 14px;
          text-align: left;
          background: none;
          border: none;
          font-size: 13.5px;
          color: #444444;
          cursor: pointer;
          transition: background 0.15s;
        }

        .tb-sort-item:hover {
          background: #f4f4f5;
        }

        .tb-sort-item.active-sort {
          background: #f0f0f0;
          font-weight: 500;
        }

        /* Bottom/Rating row styling */
        .tb-rating-row {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 12px;
          align-items: flex-start;
        }

        .tb-rating-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--tb-text-muted);
        }

        .tb-rating-badges-group {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        /* Badges base styling */
        .tb-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #ffffff;
          border: 1px solid #e0e0e0;
          border-radius: 20px;
     
          font-size: 20px;
          color: #444444;
          cursor: pointer;
          font-weight: 400;
          transition: all 0.15s ease;
        }

        /* Exact match active green state for rating badge */
        .tb-badge.active-rating-green {
          background: ${FILTER_CHIP_COLOR} !important;
          border-color:  ${FILTER_CHIP_COLOR}   !important;
          color: #ffffff !important;
          font-weight: 500;
        }

        .tb-badge.active-rating-green svg {
          fill: #ffffff !important;
        }


         @media (max-width: 1300px) {

            .qr-reviews-grid {
          display: grid;
          padding: 40px 0;
          grid-template-columns:  repeat(${activeDevice === "mobile" ? 1 : 2},  1fr);
          gap: 24px;
        }
         .qr-reviews-section {
   
    padding: 28px;
   
}

          .qr-review-card {
            padding: 16px;
          }
          .qr-helpful-btn, .qr-share-btn {
            padding: 7px 12px;
            font-size: 12px;
          }
       
             
        }

        @media (max-width: 480px) {

         .tb-top-row {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
          justify-content: space-between;
         
        }
.tb-filter-main-btn , .tb-sort-trigger , .tb-sort-wrapper 
{
display: block;
  width: 100%;
}
        .qr-reviews-container {

    padding: 13px;
   
}
            .qr-reviews-grid {
          display: grid;
          padding: 40px 0;
          grid-template-columns:  repeat(${activeDevice === "mobile" ? 1 : 1},  1fr);
          gap: 24px;
        }
          .qr-review-card {
            padding: 16px;
          }
          .qr-helpful-btn, .qr-share-btn {
            padding: 7px 12px;
            font-size: 12px;
          }
       
             
        }
      `}</style>
      <div className="qr-reviews-container">
        <section className="qr-reviews-section">
          <ReaviewHeader activeDevice={activeDevice} settings={settings} />

          {/* -----------Filtering and Sorting----------- */}
          <div className="tb-container">
            {filterSorting !== "None" && (
              <div className="tb-top-row">
                {/* FILTER */}
                {(filterSorting === "Filter & sorting both" ||
                  filterSorting === "Filter only") && (
                  <button
                    onClick={() => setIsFilterign(!isFilterign)}
                    className="tb-filter-main-btn"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                    Filter
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                )}

                {/* SORTING */}
                {(filterSorting === "Filter & sorting both" ||
                  filterSorting === "Sorting only") && (
                  <div className="tb-sort-wrapper">
                    <button
                      className="tb-sort-trigger"
                      onClick={() => setIsSortOpen(!isSortOpen)}
                    >
                      Sort by: <span>{selectedSort}</span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {isSortOpen && (
                      <div className="tb-sort-dropdown">
                        {sortOptions.map((option) => (
                          <button
                            key={option}
                            className={`tb-sort-item ${
                              selectedSort === option ? "active-sort" : ""
                            }`}
                            onClick={() => {
                              setSelectedSort(option);
                              setIsSortOpen(false);
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Filter By Rating Selector Row */}
            {isFilterign && (
              <div className="tb-rating-row">
                <span className="tb-rating-label">Rating</span>
                <div className="tb-rating-badges-group">
                  {ratings.map((rate) => {
                    const isActive = activeRating === rate;
                    return (
                      <button
                        key={rate}
                         style={{
      padding: rate === "All" ? "7px 25px" : "3px 14px",
    }}
                        onClick={() => setActiveRating(rate)}
                        className={`tb-badge ${isActive ? "active-rating-green" : ""}`}
                      >
                        {rate}
                        {typeof rate === "number" && (

                           <StarSVG
                    STAR_COLOR={isActive ? FILTER_CHIP_COLOR_STAR_COLOR :  STAR_COLOR}
                    size={24}
                  />
                         
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Grid Layout */}
          <div className="qr-reviews-grid">
            {/* Card exactly matched with image_57bf9f.png */}

            {visibleReviews.map((review) => {
              const visibleMedia = review.media.slice(0, 2);
              const extraMediaCount = Math.max(review.media.length - 2, 0);

              return (
              <div className="qr-review-card" key={review.id}>
                {/* Top Row: User Avatar & Meta */}
                <div className="qr-reviewer-info">
                  <img
                    className="qr-reviewer-avatar"
                    src={review.avatar}
                    alt={review.name}
                  />
                  <div className="qr-reviewer-meta">
                    <div className="qr-reviewer-name-row">
                      {showReviewerName && (
                        <span className="qr-reviewer-name">{review.name}</span>
                      )}
                      {showVerifiedBadge && (
                        <span className="qr-verified-check">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 512 512"
                            fill={`${VERIFIED_BADGE_COLOR}`}
                          >
                            <path d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0zM371.1 204.1l-128 128c-6.3 6.3-16.4 6.3-22.6 0l-64-64c-6.3-6.3-6.3-16.4 0-22.6s16.4-6.3 22.6 0L232 297.4l116.5-116.5c6.3-6.3 16.4-6.3 22.6 0s6.3 16.4 0 22.6z" />
                          </svg>
                        </span>
                      )}
                    </div>
                    {showReviewTimer && (
                      <span className="qr-reviewer-time">{review.time}</span>
                    )}
                  </div>
                </div>

                {/* Stars Row */}
                {showStarDistribution && (
                  <div className="qr-card-stars">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        width="16"
                        height="15"
                        viewBox="0 0 17 16"
                        fill={i < review.rating ? `${STAR_COLOR}` : "#d6d6d6"}
                      >
                        <path d="M9.51964 0.855C8.97604 -0.285 7.35604 -0.285 6.81244 0.855L5.14444 4.3494L1.30564 4.8546C0.0552353 5.0202 -0.446365 6.561 0.469235 7.4298L3.27724 10.0962L2.57284 13.9026C2.34244 15.1434 3.65404 16.0962 4.76284 15.495L8.16604 13.647L11.5692 15.495C12.678 16.0962 13.9896 15.1434 13.7592 13.9026L13.0548 10.0962L15.8628 7.4298C16.7772 6.561 16.2768 5.0202 15.0264 4.8546L11.1864 4.3494L9.51964 0.855Z" />
                      </svg>
                    ))}
                  </div>
                )}

                {/* Review Content Text */}
                <p className="qr-review-text">{review.review}</p>

                {/* Image Gallery Row */}
                {showMediaAsset && visibleMedia.length > 0 && (
                  <div
                    className={`qr-review-gallery ${
                      visibleMedia.length === 1 ? "single-media" : ""
                    }`}
                  >
                    {visibleMedia.map((media, mediaIndex) => (
                      <div
                        className="qr-gallery-item"
                        key={`${review.id}-${mediaIndex}`}
                      >
                        <img
                          className="qr-gallery-img"
                          src={media.type === "video" ? media.thumb : media.url}
                          alt={media.alt}
                        />
                        {media.type === "video" && (
                          <span className="qr-gallery-play">
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="12" viewBox="0 0 11 12" fill="none">
<path fill-rule="evenodd" clip-rule="evenodd" d="M9.65428 4.35495C10.767 4.99762 10.767 6.60332 9.65428 7.24504L2.50296 11.3737C1.39022 12.0164 0 11.2135 0 9.92916V1.67178C0 0.386447 1.39022 -0.416407 2.50296 0.226257L9.65428 4.35495ZM8.93915 6.00643C8.97538 5.9855 9.00547 5.95541 9.02639 5.91918C9.04731 5.88294 9.05832 5.84183 9.05832 5.79999C9.05832 5.75815 9.04731 5.71705 9.02639 5.68081C9.00547 5.64457 8.97538 5.61448 8.93915 5.59356L1.78783 1.46487C1.75156 1.44392 1.71041 1.43291 1.66852 1.43293C1.62664 1.43295 1.5855 1.44401 1.54925 1.46498C1.513 1.48596 1.48291 1.51612 1.46202 1.55242C1.44113 1.58873 1.43018 1.62989 1.43026 1.67178V9.92916C1.43035 9.97097 1.44142 10.012 1.46238 10.0482C1.48334 10.0844 1.51344 10.1144 1.54966 10.1352C1.58588 10.1561 1.62696 10.1671 1.66876 10.1671C1.71056 10.167 1.75163 10.156 1.78783 10.1351L8.93915 6.00643Z" fill="#303030"/>
</svg>
                          </span>
                        )}
                        {mediaIndex === 1 && extraMediaCount > 0 && (
                          <div className="qr-gallery-overlay">
                            +{extraMediaCount}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Product Tag Badge */}
                <div className="qr-product-tag">
                  <span className="qr-product-icon">🧴</span>
                  <span className="qr-product-name">{review.productName}</span>
                </div>

                {/* Bottom Footer Actions */}
                <div className="qr-card-footer">
                  {showAppreciationOption && (
                    <button className="qr-helpful-btn">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                      </svg>
                      Helpful ({review.helpfulCount})
                    </button>
                  )}

                  {showShareOption && (
                    <button className="qr-share-btn">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                      </svg>
                      Share
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          </div>      <div>    <LodeMoreButton />  </div>        
         
        </section>   
  

      </div>
   
    </>
  );
}
