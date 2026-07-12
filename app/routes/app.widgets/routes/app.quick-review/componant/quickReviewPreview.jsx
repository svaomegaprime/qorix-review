import { useState } from "react";
import reviewsData from "./review.json";

const StarSVG = ({ filled, STAR_COLOR, size = 20 }) => (
  "",
  (
    <svg
      width={size}
      height={size}
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill={filled ? STAR_COLOR : "#B5B5B5"}
        d="M9.51964 0.855C8.97604 -0.285 7.35604 -0.285 6.81244 0.855L5.14444 4.3494L1.30564 4.8546C0.0552353 5.0202 -0.446365 6.561 0.469235 7.4298L3.27724 10.0962L2.57284 13.9026C2.34244 15.1434 3.65404 16.0962 4.76284 15.495L8.16604 13.647L11.5692 15.495C12.678 16.0962 13.9896 15.1434 13.7592 13.9026L13.0548 10.0962L15.8628 7.4298C16.7772 6.561 16.2768 5.0202 15.0264 4.8546L11.1864 4.3494L9.51964 0.855Z"
      />
    </svg>
  )
);

function WriteReviewModal({ onClose, quickReview, quickReviewTab }) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const {
    name,
    email,
    review,
    photo,
    video,
    // ---from text-----
    formTitle,
    formSubtitle,
    submitButtonText,
    successMessage,
    successMessageTitle,
    successButtonText,
    colorValues,
  } = quickReview;

  const {
    STAR_COLOR,
    TEXT_COLOR,
    VERIFIED_BADGE_COLOR,
    Card_Background_Color,
    Border_Color,
    Submit_Button_Color,
  } = colorValues;
  const { success } = quickReviewTab;
  return (
    <div className="rv-modal-backdrop" onClick={onClose}>
      <div className="rv-modal" onClick={(e) => e.stopPropagation()}>
        <button className="rv-lb-close" onClick={onClose}>
          ×
        </button>

        {success ? (
          <div>
            <div class="quick-review-popup">
              <div class="icon-wrapper">
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    stroke={Submit_Button_Color}
                    stroke-width="2"
                    fill="none"
                  />
                  <path
                    d="M12 20L17.5 25.5L28 15"
                    stroke={Submit_Button_Color}
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div class="qucik-review-success-message">
                <h2>{successMessageTitle}</h2>
                <p>{successMessage}</p>
              </div>

              <button class="btn">{successButtonText}</button>
            </div>{" "}
          </div>
        ) : (
          <div>
            {" "}
            <div className="rv-modal-header">
              <div className="rv-modal-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
                    stroke={TEXT_COLOR}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3 className="rv-modal-title">{formTitle}</h3>

                <p className="rv-modal-sub">{formSubtitle}</p>
              </div>
            </div>
            <label className="rv-modal-label">
              Your rating <span className="rv-req">*</span>
            </label>
            <div className="rv-modal-stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setSelected(s)}
                  style={{ cursor: "pointer" }}
                >
                  <StarSVG
                    filled={s <= (hovered || selected)}
                    STAR_COLOR={STAR_COLOR}
                    size={28}
                  />
                </span>
              ))}
            </div>
            <label className="rv-modal-label">
              Your review <span className="rv-req">*</span>
            </label>
            <textarea
              className="rv-modal-textarea"
              placeholder="Tell us what you loved or didn't like..."
            />
            <div className="rv-modal-two-col">
              {name && (
                <div>
                  <label className="rv-modal-label">
                    Your name <span className="rv-req">*</span>
                  </label>
                  <input
                    className="rv-modal-input"
                    type="text"
                    placeholder="Enter your name"
                  />
                </div>
              )}

              {email && (
                <div>
                  <label className="rv-modal-label">Email (Optional)</label>
                  <input
                    className="rv-modal-input"
                    type="email"
                    placeholder="Enter your email"
                  />
                </div>
              )}
            </div>
            <label className="rv-modal-label">Add media (optional)</label>
            <div className="rv-modal-upload">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                style={{ display: "block", margin: "0 auto 6px" }}
              >
                <path
                  d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                  stroke="#888"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Click to upload or drag and drop
              <br />
              <span style={{ fontSize: 11 }}>
                JPG, PNG, MP4, MOV up to 20MB each
              </span>
            </div>
            <button className="rv-submit-btn">{submitButtonText}</button>
            <p className="rv-modal-footer">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                style={{ verticalAlign: "-1px" }}
              >
                <rect
                  x="3"
                  y="11"
                  width="18"
                  height="11"
                  rx="2"
                  stroke="#888"
                  strokeWidth="2"
                />
                <path
                  d="M7 11V7a5 5 0 0110 0v4"
                  stroke="#888"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>{" "}
              No account required · Your review is public
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReviewList({
  quickReview,
  quickReviewTab,
  activeDevice,
}) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [showManuFiltering, setShowManuFiltering] = useState(true);
  const [showFilteringPopover, setShowFilteringPopover] = useState(false);

  const [selectedFilter, setSelectedFilter] = useState("Highest rating");
  const [lightbox, setLightbox] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const {
    name,
    email,
    borderRadius,
    showReviewerName,
    showReviewerImage,
    showReviewerVideo,
    showProductName,
    showVerifiedBadge,
    showReviewDate,
    showRatingFilter,
    reviewPerPage,
    defaultSort,
    colorValues,
  } = quickReview;

  const {
    STAR_COLOR,
    TEXT_COLOR,
    VERIFIED_BADGE_COLOR,
    Card_Background_Color,
    Border_Color,
    Submit_Button_Color,
  } = colorValues;

  const filters = ["All", 1, 2, 3, 4, 5];

  const filteredReviews =
    activeFilter === "All"
      ? reviewsData
      : reviewsData.filter((r) => r.rating === activeFilter);

  const avgRating = (
    reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length
  ).toFixed(1);

  const { success, reviewPopup } = quickReviewTab;
  return (
    <>
      <style>{`
        .quick-review { background: #ddd; padding: 40px 0;position: relative; }
        .rv-wrap {

  background: rgba(0,0,0,0.45);
 
  align-items: center;
  justify-content: center; max-width: ${activeDevice === "mobile" ? "25%" : "1200px"}; margin: 0 auto; padding: ${activeDevice === "mobile" ? "20px" : "100px"} ; color: #1a1a1a; background: white; height: 700px; overflow: auto; }
        .rv-header-top { display: flex; align-items: flex-start; justify-content: space-between; }
        .rv-title { font-size: 16px; font-weight: 500; margin: 0 0 6px; }
        .rv-avg-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 14px; }
        .rv-avg-num { font-size: 48px; font-weight: 700; line-height: 1; }
        .rv-count { font-size: 14px; color: #6d7175; }
        .rv-write-btn { background: ${Submit_Button_Color}; color: ${TEXT_COLOR}; border: none; border-radius: 6px; padding: 10px 18px; font-size: 14px; font-weight: 500; cursor: pointer; margin-bottom: 16px; display: inline-block; }
        .rv-icon-group { display: flex; gap: 8px; }
        .rv-icon-btn { width: 40px; height: 40px; border: 1px solid #e4e5e7; border-radius: 8px; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #6d7175; }
        .rv-icon-btn:hover { background: #f6f6f7; }
        .rv-filter-label { font-size: 14px; font-weight: 600; margin: 0 0 4px; }
        .rv-filter-sub { font-size: 13px; color: #6d7175; margin: 0 0 10px; }
        .rv-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .rv-chip { display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; border: 1px solid #e4e5e7; border-radius: 20px; font-size: 13px; cursor: pointer; background: #fff; color: #1a1a1a; transition: all 0.15s; }
        .rv-chip:hover { border-color: #b5b5b5; }
        .rv-chip.active { background: ${Submit_Button_Color}; border-color:  ${Submit_Button_Color}; color: ${TEXT_COLOR}; font-weight: 500; }
        .rv-divider { border: none; border-top: 1px solid #e4e5e7; margin: 0; }
        .rv-card { padding: 20px 0; border-bottom: 1px solid #e4e5e7; }
        .rv-card:last-child { border-bottom: none; }
        .rv-stars { display: flex; gap: 3px; margin-bottom: 12px; }
        .rv-reviewer { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .rv-avatar { width: 44px; height: 44px; border-radius: 50%; border: 1px solid #e4e5e7; object-fit: cover; flex-shrink: 0; }
        .rv-avatar-ph { width: 44px; height: 44px; border-radius: 50%; border: 1px solid #e4e5e7; background: #f6f6f7; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #8c8c8c; font-size: 20px; }
        .rv-name { font-size: 14px; font-weight: 500; margin: 0; }
        .rv-time { font-size: 12px; color: #6d7175; margin: 2px 0 0; }
        .rv-product { font-size: 14px; font-weight: 600; margin: 0 0 4px; }
        .rv-text { font-size: 14px; color: #3d3d3d; margin: 0 0 14px; line-height: 1.5; }
        .rv-media-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .rv-media-thumb { position: relative; width: 80px; height: 80px; border-radius: 6px; overflow: hidden; cursor: pointer; flex-shrink: 0; }
        .rv-media-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .rv-media-thumb:hover img { opacity: 0.82; }
        .rv-play-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.28); }
        .rv-play-icon { width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.9); display: flex; align-items: center; justify-content: center; font-size: 12px; color: #1a1a1a; padding-left: 2px; }
        .rv-lightbox { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.82); display: flex; align-items: center; justify-content: center; }
        .rv-lightbox-inner { position: relative; max-width: 90vw; max-height: 90vh; }
        .rv-lightbox-inner img { max-width: 90vw; max-height: 85vh; border-radius: 8px; display: block; }
        .rv-lightbox-inner video { max-width: 90vw; max-height: 85vh; border-radius: 8px; display: block; outline: none; }
        .rv-lb-close { position: absolute; top: -14px; right: -14px; width: 32px; height: 32px; border-radius: 50%; background: #fff; border: none; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.25); line-height: 1; }
        .rv-empty { text-align: center; padding: 40px 20px; color: #6d7175; font-size: 14px; }

        /* Modal */
        .rv-modal-backdrop {
           position: absolute; /* fixed এর বদলে absolute */
  inset: 0;
  z-index: 999;
  background: rgba(0,0,0,0.45);
  display: flex;
       
  justify-content: center;
         }
        .rv-modal {height:${success ? (activeDevice === "mobile" ? "40%" : "30%") : activeDevice === "mobile" ? "70%" : "55%"} ;margin-top: 40px; background: #fff; border-radius:${borderRadius}px; padding: 24px; width: 400px; max-width: 50vw; position: relative; overflow:; }
        .rv-modal-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .rv-modal-icon { width: 36px; height: 36px; border-radius: 50%; background:  ${Submit_Button_Color}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .rv-modal-title { font-size: 16px; font-weight: 600; margin: 0 0 2px; }
        .rv-modal-sub { font-size: 13px; color: #6d7175; margin: 0; }
        .rv-modal-label { font-size: 13px; font-weight: 500; display: block; margin-bottom: 6px; color: #1a1a1a;width: 100%; }
        .rv-req { color: #c00; margin-left: 2px; }
        .rv-modal-stars { display: flex; gap: 6px; margin-bottom: 16px; }
        .rv-modal-textarea { width: 100%; border: 1px solid #e4e5e7; border-radius: 6px; padding: 10px; font-size: 13px; resize: vertical; min-height: 90px; box-sizing: border-box; color: #1a1a1a; background: #fff; margin-bottom: 14px; font-family: inherit; }
        .rv-modal-textarea::placeholder { color: #aaa; }
        .rv-modal-two-col { display: grid; grid-template-columns:repeat(${email && name ? "2" : "1"}, 1fr); gap: 10px; margin-bottom: 14px; }
        .rv-modal-input { width: 100%; border: 1px solid #e4e5e7; border-radius: 6px; padding: 9px 10px; font-size: 13px; box-sizing: border-box; color: #1a1a1a; background: #fff; font-family: inherit; }
        .rv-modal-input::placeholder { color: #aaa; }
        .rv-modal-upload { border: 1.5px dashed #ccc; border-radius: 8px; padding: 14px; text-align: center; font-size: 12px; color: #888; cursor: pointer; margin-bottom: 16px; }
        .rv-submit-btn { width: 100%; background:  ${Submit_Button_Color}; color: ${TEXT_COLOR}; border: none; border-radius: 8px; padding: 12px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .rv-modal-footer { text-align: center; font-size: 11px; color: #888; margin-top: 10px; }

        // ------------success modal------------ //
        .quick-review-popup {
      background: #fff;
      border-radius: 20px;
      padding: 2.5rem 2rem 2rem;
      max-width: 340px;
      width: 100%;
      text-align: center !important;
      border: 0.5px solid #e0e0e0;
  
    }

   .quick-review-popup .icon-wrapper {
      width: 90px;
      height: 90px;
      margin: 0 auto 1.5rem;
    }
    .qucik-review-success-message{
    text-align: center !important;
    }

   .qucik-review-success-message h2 {
      font-size: 18px;
      font-weight: 500;
      color: #111;
      margin-bottom: 0.75rem;
    }

   .qucik-review-success-message p {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
      margin-bottom: 1.75rem;
    }

    .quick-review-popup .btn {
      width: 100%;
      padding: 11px;
      background:  ${Submit_Button_Color};
      color: ${TEXT_COLOR};
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
    }
      `}</style>

      <div className="quick-review">
        <div className="rv-wrap">
          {/* Header */}
          <div className="rv-header-top">
            <div>
              <p className="rv-title">Customer Reviews</p>
              <div className="rv-avg-row">
                <span className="rv-avg-num">{avgRating}</span>
                <span className="rv-count">{reviewsData.length} reviews</span>
              </div>
              <button className="rv-write-btn">Write a review</button>
              {(reviewPopup || quickReviewTab?.success) && (
                <WriteReviewModal
                  quickReviewTab={quickReviewTab}
                  quickReview={quickReview}
                  onClose={() => setShowModal(false)}
                />
              )}
            </div>
            <div className="rv-icon-group">
              <button
                onClick={() => setShowManuFiltering(!showManuFiltering)}
                className="rv-icon-btn"
                title="Sort"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M3.59961 7.2C3.59961 6.9613 3.69443 6.73239 3.86321 6.5636C4.032 6.39482 4.26091 6.3 4.49961 6.3H19.4996C19.7383 6.3 19.9672 6.39482 20.136 6.5636C20.3048 6.73239 20.3996 6.9613 20.3996 7.2C20.3996 7.43869 20.3048 7.66761 20.136 7.8364C19.9672 8.00518 19.7383 8.1 19.4996 8.1H4.49961C4.26091 8.1 4.032 8.00518 3.86321 7.8364C3.69443 7.66761 3.59961 7.43869 3.59961 7.2Z"
                    fill="#303030"
                  />
                  <path
                    d="M8.09961 16.8C8.09961 16.5613 8.19443 16.3324 8.36321 16.1636C8.532 15.9948 8.76091 15.9 8.99961 15.9H14.9996C15.2383 15.9 15.4672 15.9948 15.636 16.1636C15.8048 16.3324 15.8996 16.5613 15.8996 16.8C15.8996 17.0387 15.8048 17.2676 15.636 17.4364C15.4672 17.6052 15.2383 17.7 14.9996 17.7H8.99961C8.76091 17.7 8.532 17.6052 8.36321 17.4364C8.19443 17.2676 8.09961 17.0387 8.09961 16.8Z"
                    fill="#4A4A4A"
                  />
                  <path
                    d="M6.59922 11.1C6.36052 11.1 6.13161 11.1948 5.96282 11.3636C5.79404 11.5324 5.69922 11.7613 5.69922 12C5.69922 12.2387 5.79404 12.4676 5.96282 12.6364C6.13161 12.8052 6.36052 12.9 6.59922 12.9H17.3992C17.6379 12.9 17.8668 12.8052 18.0356 12.6364C18.2044 12.4676 18.2992 12.2387 18.2992 12C18.2992 11.7613 18.2044 11.5324 18.0356 11.3636C17.8668 11.1948 17.6379 11.1 17.3992 11.1H6.59922Z"
                    fill="#4A4A4A"
                  />
                </svg>
              </button>

              <div style={{ position: "relative", display: "inline-block" }}>
                <button
                  onClick={() => setShowFilteringPopover(!showFilteringPopover)}
                  className="rv-icon-btn"
                  title="Filter"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M9.75 0.750003C12.505 0.750003 15.205 0.982003 17.833 1.428C18.366 1.518 18.75 1.984 18.75 2.524V3.568C18.75 3.86348 18.6918 4.15606 18.5787 4.42904C18.4657 4.70203 18.2999 4.95007 18.091 5.159L12.659 10.591C12.4501 10.7999 12.2843 11.048 12.1713 11.321C12.0582 11.5939 12 11.8865 12 12.182V15.109C12.0001 15.527 11.8837 15.9367 11.664 16.2923C11.4443 16.6478 11.1299 16.9351 10.756 17.122L7.5 18.75V12.182C7.5 11.8865 7.44181 11.5939 7.32874 11.321C7.21566 11.048 7.04993 10.7999 6.841 10.591L1.409 5.159C1.20007 4.95007 1.03434 4.70203 0.921265 4.42904C0.808193 4.15606 0.749997 3.86348 0.75 3.568V2.524C0.75 1.984 1.134 1.518 1.667 1.428C4.33757 0.975856 7.04143 0.749058 9.75 0.750003Z"
                      stroke="#4A4A4A"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {showFilteringPopover && (
                  <div
                    style={{
                      position: "absolute",
                      top: "110%",
                      right: 0,
                      background: "#fff",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                      minWidth: "180px",
                      zIndex: 100,
                      overflow: "hidden",
                    }}
                  >
                    {[
                      "Highest rating",
                      "Lowest rating",
                      "Only pictures",
                      "Pictures first",
                      "Videos first",
                      "Most helpful",
                    ].map((option) => (
                      <div
                        key={option}
                        onClick={() => {
                          setSelectedFilter(option);
                          setShowFilteringPopover(false);
                        }}
                        style={{
                          padding: "10px 16px",
                          fontSize: "14px",
                          cursor: "pointer",
                          color: "#222",
                          background:
                            selectedFilter === option ? "#f0f0f0" : "#fff",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#f5f5f5")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            selectedFilter === option ? "#f0f0f0" : "#fff")
                        }
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          {showManuFiltering && (
            <>
              {" "}
              <p className="rv-filter-label">Filters</p>
              <p className="rv-filter-sub">Rating</p>
              <div className="rv-chips">
                {filters.map((f) => (
                  <button
                    key={f}
                    className={`rv-chip ${activeFilter === f ? "active" : ""}`}
                    onClick={() => setActiveFilter(f)}
                  >
                    {f === "All" ? (
                      "All"
                    ) : (
                      <>
                        {f}{" "}
                        <StarSVG
                          filled={true}
                          STAR_COLOR={STAR_COLOR}
                          size={13}
                        />
                      </>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          <hr className="rv-divider" />

          {/* Review cards */}
          {filteredReviews.length === 0 ? (
            <div className="rv-empty">No reviews found for this rating.</div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review.id} className="rv-card">
                {showRatingFilter && (
                  <div className="rv-stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <StarSVG
                        key={s}
                        filled={s <= review.rating}
                        STAR_COLOR={STAR_COLOR}
                        size={20}
                      />
                    ))}
                  </div>
                )}

                <div className="rv-reviewer">
                  {review.avatar ? (
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="rv-avatar"
                    />
                  ) : (
                    <div className="rv-avatar-ph">👤</div>
                  )}

                  <div>
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                        height: "20px",
                        justifyItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {showReviewerName && (
                        <p className="rv-name">{review.name}</p>
                      )}

                      {showVerifiedBadge && (
                        <p>
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
                        </p>
                      )}
                    </div>

                    {showReviewDate && <p className="rv-time">{review.time}</p>}
                  </div>
                </div>

                {showProductName && (
                  <p className="rv-product">{review.product}</p>
                )}

                <p className="rv-text">{review.review}</p>
                {review.media.length > 0 &&
                  (showReviewerImage || showReviewerVideo) && (
                    <div className="rv-media-row">
                      {review.media.map((item, i) => (
                        <div
                          key={i}
                          className="rv-media-thumb"
                          onClick={() => setLightbox(item)}
                        >
                          {item.type === "image"
                            ? showReviewerImage && (
                                <img src={item.url} alt={`media-${i}`} />
                              )
                            : showReviewerVideo && (
                                <>
                                  <img
                                    src={item.thumb}
                                    alt={`video-thumb-${i}`}
                                  />
                                  <div className="rv-play-overlay">
                                    <div className="rv-play-icon">▶</div>
                                  </div>
                                </>
                              )}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="rv-lightbox" onClick={() => setLightbox(null)}>
          <div
            className="rv-lightbox-inner"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="rv-lb-close" onClick={() => setLightbox(null)}>
              ×
            </button>
            {lightbox.type === "image" ? (
              <img src={lightbox.url} alt="preview" />
            ) : (
              <video src={lightbox.url} controls autoPlay />
            )}
          </div>
        </div>
      )}

      {/* Write Review Modal */}
    </>
  );
}
