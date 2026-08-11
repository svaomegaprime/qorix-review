import { useState, useEffect, useRef, useLayoutEffect, useMemo } from "react";
import ReaviewHeader from "../../../components/elements/WidgetsHeader";
const GAP = 24;
const TRANSITION = "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)";

const CAROUSEL_CONFIG = {
  showAutoPlay: true,
  autoplaySpeed: 4000,
  showDots: true,
  showArrows: true,
  cardsVisible: 3,
  filterMinStars: 0,
};

const REVIEWS = [
  {
    id: 1,
    mediaType: "image",
    image:
      "https://s3.zenex.cloud/nextvence/uploads/images/p1-2026-07-28-08:55:42-1785207342582.png",
    imageAlt: "Hydrating Eye Cream",
    product: "Product: Hydrating Eye Cream",
    quote:
      "Absolutely love this cream! My under-eye area feels smoother, softer, and well hydrated.",
    name: "Abdur Razzak",
    avatar: `https://res.cloudinary.com/bkkqeqan/image/upload/v1785919600/razzakislam_dpykkd.png`,
    date: "2 days ago",
    stars: 4,
  },
  {
    id: 2,
    mediaType: "video",
    videoSrc:
      "https://s3.zenex.cloud/nextvence/uploads/videos/pv3-2026-07-28-09:11:16-1785208276075.mp4",
    image:
      "https://s3.zenex.cloud/nextvence/uploads/images/p4-2026-07-28-08:55:43-1785207343330.png",
    imageAlt: "Vitamin C Serum",
    product: "Product: Vitamin C Serum",
    quote:
      "This serum gives my skin a fresh glow and makes my complexion look noticeably brighter.",
    name: "Abir Rayhan",
    avatar:
      "https://s3.zenex.cloud/nextvence/uploads/images/u1-2026-07-28-08:55:40-1785207340918.png",
    date: "5 hours ago",
    stars: 5,
  },
  {
    id: 3,
    mediaType: "image",
    image:
      "https://s3.zenex.cloud/nextvence/uploads/images/p7-2026-07-28-08:55:44-1785207344084.png",
    imageAlt: "Gentle Facial Cleanser",
    product: "Product: Gentle Facial Cleanser",
    quote:
      "It removes dirt and makeup effectively without leaving my skin feeling dry or tight.",
    name: "Osman Hasan",
    avatar:
      "https://s3.zenex.cloud/nextvence/uploads/images/u2-2026-07-28-08:55:41-1785207341155.png",
    date: "1 week ago",
    stars: 5,
  },
  {
    id: 4,
    mediaType: "image",
    image:
      "https://s3.zenex.cloud/nextvence/uploads/images/p10-2026-07-28-08:55:44-1785207344825.png",
    imageAlt: "Face Moisturizer",
    product: "Product: Face Moisturizer",
    quote:
      "My skin feels deeply moisturized, plump, and comfortable throughout the day.",
    name: "Imran Khan",
    avatar:
      "https://s3.zenex.cloud/nextvence/uploads/images/u3-2026-07-28-08:55:41-1785207341391.png",
    date: "1 week ago",
    stars: 5,
  },
  {
    id: 5,
    mediaType: "video",
    videoSrc:
      "https://s3.zenex.cloud/nextvence/uploads/videos/pv2-2026-07-28-09:11:13-1785208273276.mp4",
    image:
      "https://s3.zenex.cloud/nextvence/uploads/images/p13-2026-07-28-08:55:45-1785207345556.png",
    imageAlt: "Niacinamide Serum",
    product: "Product: Niacinamide Serum",
    quote:
      "It has helped improve my skin texture and made my pores appear less noticeable.",
    name: "Tanvir Ahmed",
    avatar:
      "https://s3.zenex.cloud/nextvence/uploads/images/u4-2026-07-28-08:55:41-1785207341627.png",
    date: "1 week ago",
    stars: 5,
  },
  {
    id: 6,
    mediaType: "image",
    image:
      "https://s3.zenex.cloud/nextvence/uploads/images/p16-2026-07-28-08:55:36-1785207336465.png",
    imageAlt: "Soothing Aloe Vera Gel",
    product: "Product: Soothing Aloe Vera Gel",
    quote:
      "The lightweight formula feels cooling and instantly calms my dry, irritated skin.",
    name: "Abdur Rahman",
    avatar:
      "https://s3.zenex.cloud/nextvence/uploads/images/u5-2026-07-28-08:55:41-1785207341869.png",
    date: "1 month ago",
    stars: 5,
  },
  {
    id: 7,
    mediaType: "video",
    videoSrc:
      "https://s3.zenex.cloud/nextvence/uploads/videos/pv12-2026-07-28-09:15:31-1785208531600.mp4",
    image:
      "https://s3.zenex.cloud/nextvence/uploads/images/p19-2026-07-28-08:55:39-1785207339190.png",
    imageAlt: "Sunscreen SPF 50",
    product: "Product: Sunscreen SPF 50",
    quote:
      "It blends easily, feels light on the skin, and leaves no greasy finish or white cast.",
    name: "Taj Uddin",
    avatar:
      "https://s3.zenex.cloud/nextvence/uploads/images/u6-2026-07-28-08:55:42-1785207342107.png",
    date: "1 week ago",
    stars: 5,
  },
];
const STYLES = `
[data-section="qorix-review-reel-widget"] {
  ---color-text-primary: #303030;
  ---color-text-green: #008923;
  ---color-text-secondary: #616161;
  ---color-text-product-name: #0d2440;
}

section.qorix-review-reel-real-review-section {
  margin-top: var(---stack-mobile_margin_top);
  padding:var(---stack-mobile_padding, 0px 40px);

}

  .qorix-review-reel-secound_container {
    width: var(---preview_mobile_width, 100%);
    margin: 0 auto;


}

.qorix-review-reel-header{

padding:20px 20px 0px 20px;


}

.qorix-review-reel-main_container{
  background-color: #ddd;
  padding: 40px;
  height : 650px;
  overflow: scroll;
  }

[data-section="qorix-review-reel-widget"] .qorix-review-reel-real-review-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 50px;
  padding: 80px 40px;
  max-width: 1405px;
  margin: 0 auto;
  text-align: center;
}

[data-section="qorix-review-reel-widget"] .qorix-review-reel-swiper-wrapper {
  width: 90%;
  margin: 0 auto;
  position: relative;
  padding-bottom: 48px;
}

/* ── Track (replaces Swiper internals) ── */
[data-section="qorix-review-reel-widget"] .qorix-review-reel-track-wrapper {
  overflow: hidden;
  padding-bottom: 20px;
  user-select: none;
  touch-action: pan-y;
}

[data-section="qorix-review-reel-widget"] .qorix-review-reel-track {
  display: flex;
  gap: 24px;
  will-change: transform;
  align-items: flex-start;
}

[data-section="qorix-review-reel-widget"] .qorix-review-reel-slide {
  flex: 0 0 auto;
  min-width: 0;
}

/* ── Nav arrows ── */
[data-section="qorix-review-reel-widget"] .qorix-review-reel-swiper-button-next,
[data-section="qorix-review-reel-widget"] .qorix-review-reel-swiper-button-prev {
  position: absolute;
  cursor: pointer;
  z-index: 10;
  width: 44px;
  height: 44px;
  background: #fff;
  border: none;
  border-radius: 99px;
  box-shadow:
    inset 0px -1px 0px #b5b5b5,
    inset 0px 0px 0px 1px rgba(0,0,0,0.1),
    inset 0px 0.5px 0px 1.5px #fff;
  top: 38%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.15s, opacity 0.2s;
}

[data-section="qorix-review-reel-widget"] .qorix-review-reel-swiper-button-next:hover,
[data-section="qorix-review-reel-widget"] .qorix-review-reel-swiper-button-prev:hover {
  box-shadow:
    inset 0px -1px 0px #999,
    inset 0px 0px 0px 1px rgba(0,0,0,0.18),
    inset 0px 0.5px 0px 1.5px #fff;
}

[data-section="qorix-review-reel-widget"] .qorix-review-reel-swiper-button-next { right: -28px; }
[data-section="qorix-review-reel-widget"] .qorix-review-reel-swiper-button-prev { left: -28px; }

/* ── Controls & Pagination ── */
[data-section="qorix-review-reel-widget"] .qorix-review-reel-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

[data-section="qorix-review-reel-widget"] .qorix-review-reel-swiper-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 24px;
}

/* Mobile Active Device Override */
[data-section="qorix-review-reel-widget"].qorix-review-reel-mobile .qorix-review-reel-swiper-wrapper {
  padding-bottom: 0px;
}

[data-section="qorix-review-reel-widget"].qorix-review-reel-mobile .qorix-review-reel-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
  padding-bottom : 30px;
  width: 100%;
}

[data-section="qorix-review-reel-widget"].qorix-review-reel-mobile .qorix-review-reel-swiper-button-next,
[data-section="qorix-review-reel-widget"].qorix-review-reel-mobile .qorix-review-reel-swiper-button-prev {
  position: static;
  transform: none;
  top: auto;
  left: auto;
  right: auto;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

[data-section="qorix-review-reel-widget"].qorix-review-reel-mobile .qorix-review-reel-swiper-pagination {
  position: static;
  margin-top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

[data-section="qorix-review-reel-widget"] .qorix-review-reel-pagination-bullet {
  width: 8px;
  height: 8px;
  border: none;
  padding: 0;
  cursor: pointer;
  border-radius: 99px;
  background: #d9d9d9;
  transition: background 0.25s, width 0.25s;
}

[data-section="qorix-review-reel-widget"] .qorix-review-reel-pagination-bullet.active {
  background:  var(--activedotted_color, #34c759);
  width: 24px;
}

/* ── Review card ── */
[data-section="qorix-review-reel-widget"] .qorix-review-reel-review-card {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: var(--card_background, #fff);
  border: 1px solid #eff2f5;
  border-radius: 16px;
  gap: 20px;
  height: auto !important;
}

[data-section="qorix-review-reel-widget"] .qorix-review-reel-review-card-image {
  position: relative;
  width: 100%;
  height: 272px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f0f2f5;
}

[data-section="qorix-review-reel-widget"] .qorix-review-reel-review-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

[data-section="qorix-review-reel-widget"] .qorix-review-reel-play-btn {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: transform 0.15s, background 0.15s;
}

[data-section="qorix-review-reel-widget"] .qorix-review-reel-play-btn:hover {
  transform: translate(-50%, -50%) scale(1.08);
}

[data-section="qorix-review-reel-widget"] .qorix-review-reel-review-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: left;
  gap: 40px;
}

[data-section="qorix-review-reel-widget"] .qorix-review-reel-review-text {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

[data-section="qorix-review-reel-widget"] .qorix-review-reel-product-title {
  margin: 0;
  font-weight: 500;
  font-size: 1rem;
  line-height: 1.7;
  letter-spacing: -0.5px;
  color: var(--card_text_color, var(---color-text-product-name));
}

[data-section="qorix-review-reel-widget"] .qorix-review-reel-review-quote {
  margin: 0;
  font-weight: 400;
  font-size: 24px;
  line-height: 1.4;
  letter-spacing: -1px;
  color: var(--card_text_color, var(---color-text-primary));
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

[data-section="qorix-review-reel-widget"] .qorix-review-reel-review-user {
  display: flex;
  align-items: center;
  gap: 16px;
}

[data-section="qorix-review-reel-widget"] .qorix-review-reel-user-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: #eff2f5;
}

[data-section="qorix-review-reel-widget"] .qorix-review-reel-user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

[data-section="qorix-review-reel-widget"] .qorix-review-reel-user-name {
  margin: 0;
  font-weight: 500;
  font-size: 1rem;
  line-height: 1.7;
  letter-spacing: -0.5px;
  color: var(--card_text_color, var(---color-text-primary));
}

[data-section="qorix-review-reel-widget"] .qorix-review-reel-review-date {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(---color-text-secondary);
}

/* ── Responsive ── */

@media (max-width: 1440px) {
  .qorix-review-reel-secound_container {
    width: var(---stack-mobile_width, 50%);
    margin: 0 auto;
}
    .qorix-review-reel-main_container{

  height : 600px;

  }

}

@media (max-width: 1030px) {
  [data-section="qorix-review-reel-widget"] .qorix-review-reel-real-review-section {
    padding: 60px 24px;
    gap: 40px;
  }

  section.qorix-review-reel-real-review-section {
  margin-top: 10px;


}
  .qorix-review-reel-controls {
    padding-bottom: 30px;
}

    .qorix-review-reel-secound_container {
    width: var(---stack-mobile_width_1024_device, 50%);
    margin: 0 auto;
}

    .qorix-review-reel-header {
    padding:20px ;
}
    .qorix-review-reel-main_container{

  height : 600px;

  }


  [data-section="qorix-review-reel-widget"] .qorix-review-reel-swiper-wrapper {
    padding-bottom: 0px;
  }

  [data-section="qorix-review-reel-widget"] .qorix-review-reel-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 16px;
    width: 100%;
  }

  [data-section="qorix-review-reel-widget"] .qorix-review-reel-swiper-button-next,
  [data-section="qorix-review-reel-widget"] .qorix-review-reel-swiper-button-prev {
    position: static;
    transform: none;
    top: auto;
    left: auto;
    right: auto;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
  }

  [data-section="qorix-review-reel-widget"] .qorix-review-reel-swiper-pagination {
    position: static;
    margin-top: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

@media (max-width: 900px){
.qorix-review-reel-main_container{
  height : 500px;
  }

  [data-section="qorix-review-reel-widget"] .qorix-review-reel-review-quote {
    font-size: 19px;
}



}

@media (max-width: 450px) {
  [data-section="qorix-review-reel-widget"] .qorix-review-reel-real-review-section {
    padding: 48px 16px;
    gap: 32px;
  }

.qorix-review-reel-main_container{
  height : 450px;
  padding: 12px;
  }

.qr-reviews-header {
    margin-bottom: 0px !important;
}

  [data-section="qorix-review-reel-widget"] .qorix-review-reel-review-card-image { height: 220px; }
  [data-section="qorix-review-reel-widget"] .qorix-review-reel-review-quote      { font-size: 20px; }


}
`;

function useSlideCount(cardsVisible) {
  const [count, setCount] = useState(() => {
    if (typeof window === "undefined") return cardsVisible;
    const w = window.innerWidth;
    if (w < 451) return 1;
    if (w < 1031) return Math.min(2, cardsVisible);
    return cardsVisible;
  });

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w < 451) setCount(1);
      else if (w < 1031) setCount(Math.min(2, cardsVisible));
      else setCount(cardsVisible);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [cardsVisible]);

  return count;
}

// ─── SVG helpers ──────────────────────────────────────────────────────────────
function PlayCircleSvg() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <g clipPath="url(#pc1)">
        <path
          d="M20 0C8.97167 0 0 8.97167 0 20C0 31.0283 8.97167 40 20 40C31.0283 40 40 31.0283 40 20C40 8.97167 31.0283 0 20 0ZM27.34 23.1217L18.6533 27.8783C18.1117 28.1833 17.515 28.335 16.9183 28.335C16.2967 28.335 15.6733 28.17 15.1067 27.84C13.995 27.19 13.3333 26.035 13.3333 24.7483V15.25C13.3333 13.9633 13.995 12.8083 15.1067 12.1583C16.215 11.51 17.5483 11.4983 18.67 12.13L27.3233 16.8683C28.4833 17.52 29.165 18.6867 29.165 19.9983C29.165 21.31 28.4833 22.4767 27.3383 23.12L27.34 23.1217Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="pc1">
          <rect width="40" height="40" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function ChevronRightSvg() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.71953 14.53C7.57908 14.3894 7.50019 14.1987 7.50019 14C7.50019 13.8012 7.57908 13.6106 7.71953 13.47L11.1895 10 7.71953 6.53C7.57908 6.3894 7.50019 6.1987 7.50019 6C7.50019 5.5858 7.83597 5.25 8.24953 5.25C8.44828 5.25 8.63891 5.3296 8.77953 5.47L12.7795 9.47C12.92 9.6106 12.9989 9.8012 12.9989 10C12.9989 10.1987 12.92 10.3894 12.7795 10.53L8.77953 14.53C8.63891 14.6704 8.44828 14.7493 8.24953 14.7493C8.05078 14.7493 7.86016 14.6704 7.71953 14.53Z"
        fill="#4A4A4A"
      />
    </svg>
  );
}

function ChevronLeftSvg() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.2805 14.53C12.4209 14.3894 12.4998 14.1987 12.4998 14C12.4998 13.8012 12.4209 13.6106 12.2805 13.47L8.81047 10 12.2805 6.53C12.4209 6.3894 12.4998 6.1987 12.4998 6C12.4998 5.5858 12.1637 5.25 11.7505 5.25C11.5517 5.25 11.3611 5.3296 11.2205 5.47L7.22047 9.47C7.08002 9.6106 7.00113 9.8012 7.00113 10C7.00113 10.1987 7.08002 10.3894 7.22047 10.53L11.2205 14.53C11.3611 14.6704 11.5517 14.7493 11.7505 14.7493C11.9492 14.7493 12.1398 14.6704 12.2805 14.53Z"
        fill="#4A4A4A"
      />
    </svg>
  );
}

// ─── ReviewCard ───────────────────────────────────────────────────────────────
function ReviewCard({ review, settings }) {
  const [videoActive, setVideoActive] = useState(false);
  const {
    showReviewerName,
    showVerifiedBadge,
    showProductName,
    showReviewDate,
    showReviewImage,
    startColor,
  } = settings || {};
  function handlePlay(e) {
    e.stopPropagation();
    setVideoActive(true);
  }

  return (
    <div className="qorix-review-reel-review-card">
      <div
        className="qorix-review-reel-review-card-image"
        data-media-type={review.mediaType}
      >
        {videoActive ? (
          <video
            src={review.videoSrc}
            controls
            autoPlay
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 2,
              borderRadius: 8,
            }}
          />
        ) : (
          <>
            <img src={review.image} alt={review.imageAlt} />
            {review.mediaType === "video" && (
              <button
                className="qorix-review-reel-play-btn"
                aria-label="Play video review"
                onClick={handlePlay}
              >
                <PlayCircleSvg />
              </button>
            )}
          </>
        )}
      </div>

      <div className="qorix-review-reel-review-card-content">
        <div className="qorix-review-reel-review-text">
          {showProductName && (
            <p className="qorix-review-reel-product-title">{review.product}</p>
          )}
          <h3 className="qorix-review-reel-review-quote">"{review.quote}"</h3>
        </div>
        <div className="qorix-review-reel-review-user">
          {showReviewImage && (
            <img
              className="qorix-review-reel-user-avatar"
              src={review.avatar}
              alt={review.name}
            />
          )}
          <div className="qorix-review-reel-user-info">
            <p className="qorix-review-reel-user-name">
              {showReviewerName && review.name}
              {/* {review.name} */}

              {showVerifiedBadge && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  style={{
                    marginLeft: 6,
                    verticalAlign: "middle",
                    flexShrink: 0,
                  }}
                >
                  <circle cx="12" cy="12" r="12" fill={startColor} />
                  <path
                    d="M10 15.17l-3.59-3.59L5 13l5 5 9-9-1.41-1.42z"
                    fill="#fff"
                  />
                </svg>
              )}
            </p>
            {showReviewDate && (
              <p className="qorix-review-reel-review-date">{review.date}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ReviewReelWidget({ settings, activeDevice }) {
  const config = {
    ...CAROUSEL_CONFIG,
    ...settings,
    autoplaySpeed:
      settings.autoplaySpeed != null
        ? settings.autoplaySpeed * 1000
        : CAROUSEL_CONFIG.autoplaySpeed,
  };

  const slidesPerView = useSlideCount(
    activeDevice === "mobile" ? 1 : config.cardsVisible,
  );
  const { showNavigationDots, showArrowControls } = settings || {};
  const slides = useMemo(() => REVIEWS, []);

  const extSlides = useMemo(() => {
    if (slides.length === 0) return [];
    const n = slidesPerView;
    return [...slides.slice(-n), ...slides, ...slides.slice(0, n)];
  }, [slides, slidesPerView]);

  // Mutable refs — used inside setInterval / rAF callbacks so they're always current
  const rawIndexRef = useRef(slidesPerView);
  const slideWidthRef = useRef(0);
  const trackRef = useRef(null);
  const wrapperRef = useRef(null);
  const isLoopJumping = useRef(false);
  const autoplayRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const isHoveringRef = useRef(false);
  const dragRef = useRef({ startX: 0, active: false, hasDragged: false });

  // React state — drives dot active state and re-renders
  const [rawIndex, setRawIndex] = useState(slidesPerView);
  const [slideWidth, setSlideWidth] = useState(0);

  const [autoplayKey, setAutoplayKey] = useState(0); // bump to restart the interval
  const [imagesReady, setImagesReady] = useState(false);

  // Which original slide is logically "active" (for dots)
  const realIndex =
    (((rawIndex - slidesPerView) % slides.length) + slides.length) %
    slides.length;

  // Keep refs in sync with state so interval callbacks read current values
  rawIndexRef.current = rawIndex;
  slideWidthRef.current = slideWidth;

  // ── Track position (imperative — avoids React render on every tick) ────────
  function applyOffset(idx, animate) {
    if (!trackRef.current || !slideWidthRef.current) return;
    trackRef.current.style.transition = animate ? TRANSITION : "none";
    trackRef.current.style.transform = `translateX(${-(idx * (slideWidthRef.current + GAP))}px)`;
    if (animate) isAnimatingRef.current = true;
  }

  // ── Measure & position — shared logic ──────────────────────────────────────
  function measureAndPosition() {
    const el = wrapperRef.current;
    const track = trackRef.current;
    if (!el || !track) return;
    const w = el.offsetWidth;
    if (w <= 0) return;
    const sw = (w - (slidesPerView - 1) * GAP) / slidesPerView;
    if (sw <= 0) return;

    slideWidthRef.current = sw;
    rawIndexRef.current = slidesPerView;

    setSlideWidth(sw);
    setRawIndex(slidesPerView);

    Array.from(track.children).forEach((child) => {
      child.style.width = `${sw}px`;
    });
    track.style.transition = "none";
    track.style.transform = `translateX(${-(slidesPerView * (sw + GAP))}px)`;
  }

  // ── On mount & slidesPerView change ───────────────────────────────────────
  // useLayoutEffect runs before paint, so the track is correctly positioned
  // before the user sees anything.
  useLayoutEffect(measureAndPosition, [slidesPerView]);

  // ── ResizeObserver — handles both window resize AND hidden→visible ────────
  // Unlike a plain resize listener, ResizeObserver fires when a previously
  // hidden container (display:none / conditional render) becomes visible and
  // its size changes from 0 to something real.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      measureAndPosition();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [slidesPerView]);

  function handleTransitionEnd(e) {
    if (e.target !== e.currentTarget) return;
    isAnimatingRef.current = false;
    if (isLoopJumping.current) return;
    const n = slidesPerView;
    const origLen = slides.length;
    const cur = rawIndexRef.current;

    if (cur >= n + origLen) {
      isLoopJumping.current = true;
      const jumpTo = n + (cur - (n + origLen));
      rawIndexRef.current = jumpTo;
      setRawIndex(jumpTo);
      applyOffset(jumpTo, false);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          isLoopJumping.current = false;
        }),
      );
    } else if (cur < n) {
      isLoopJumping.current = true;
      const jumpTo = n + origLen - (n - cur);
      rawIndexRef.current = jumpTo;
      setRawIndex(jumpTo);
      applyOffset(jumpTo, false);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          isLoopJumping.current = false;
        }),
      );
    }
  }

  // ── Navigation helpers ────────────────────────────────────────────────────
  function goNext() {
    if (isLoopJumping.current || isAnimatingRef.current) return;
    const next = rawIndexRef.current + 1;
    rawIndexRef.current = next;
    setRawIndex(next);
    applyOffset(next, true);
  }

  function goPrev() {
    if (isLoopJumping.current || isAnimatingRef.current) return;
    const prev = rawIndexRef.current - 1;
    rawIndexRef.current = prev;
    setRawIndex(prev);
    applyOffset(prev, true);
  }

  function goToSlide(origIdx) {
    if (isLoopJumping.current || isAnimatingRef.current) return;
    const target = slidesPerView + origIdx;
    rawIndexRef.current = target;
    setRawIndex(target);
    applyOffset(target, true);
    setAutoplayKey((k) => k + 1); // restart autoplay timer
  }

  // User-triggered nav also resets autoplay
  function handleUserNext() {
    goNext();
    setAutoplayKey((k) => k + 1);
  }
  function handleUserPrev() {
    goPrev();
    setAutoplayKey((k) => k + 1);
  }

  // ── Autoplay ─────────────────────────────────────────────────────────────
  // Restarts whenever: slideWidth changes (layout), autoplayKey bumps (user nav),
  // or config flags change.
  useEffect(() => {
    if (!config.showAutoPlay || !slideWidth || isHoveringRef.current) return;
    autoplayRef.current = setInterval(() => {
      if (!isLoopJumping.current && !isHoveringRef.current) goNext();
    }, config.autoplaySpeed);
    return () => clearInterval(autoplayRef.current);
  }, [slideWidth, config.showAutoPlay, config.autoplaySpeed, autoplayKey]);

  // ── Drag / swipe (mouse + touch) ──────────────────────────────────────────
  function startDrag(clientX) {
    dragRef.current = { startX: clientX, active: true, hasDragged: false };
    isAnimatingRef.current = false;
  }

  function onDrag(clientX) {
    if (!dragRef.current.active) return;
    const delta = clientX - dragRef.current.startX;
    if (Math.abs(delta) > 6) dragRef.current.hasDragged = true;
    if (trackRef.current && slideWidthRef.current) {
      const base = -(rawIndexRef.current * (slideWidthRef.current + GAP));
      trackRef.current.style.transition = "none";
      trackRef.current.style.transform = `translateX(${base + delta}px)`;
    }
  }

  function endDrag(clientX) {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    // Snap back — no navigation via drag
    if (trackRef.current && slideWidthRef.current) {
      trackRef.current.style.transition = TRANSITION;
      trackRef.current.style.transform = `translateX(${-(rawIndexRef.current * (slideWidthRef.current + GAP))}px)`;
    }
    setAutoplayKey((k) => k + 1);
  }

  // Touch only
  function handleTouchStart(e) {
    if (e.touches.length !== 1) return;
    startDrag(e.touches[0].clientX);
  }
  function handleTouchMove(e) {
    if (e.touches.length !== 1) return;
    onDrag(e.touches[0].clientX);
  }
  function handleTouchEnd(e) {
    endDrag(e.changedTouches[0].clientX);
  }

  // Prevent a click from firing immediately after a drag gesture
  function handleClickGuard(e) {
    if (dragRef.current.hasDragged) {
      e.stopPropagation();
      dragRef.current.hasDragged = false;
    }
  }

  // ── Preload all images so everything appears together ──────────────────────
  useEffect(() => {
    const urls = REVIEWS.flatMap((r) => [r.image, r.avatar].filter(Boolean));
    if (urls.length === 0) {
      setImagesReady(true);
      return;
    }

    let loaded = 0;
    let cancelled = false;

    urls.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        if (cancelled) return;
        loaded++;
        if (loaded === urls.length) setImagesReady(true);
      };
      img.src = src;
    });

    return () => {
      cancelled = true;
    };
  }, []);

  console.log("activeDevice", activeDevice);
  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{STYLES}</style>
      <div
        className="qorix-review-reel-main_container"
        style={{
          position: "relative",
          "--activedotted_color": settings?.activeDotColor || "#008923",
          "--card_background": settings?.cardBackgorud || "#fff",
          "--card_text_color":
            settings?.cardTextColor || "var(---color-text-primary)",

          "---preview_mobile_width":
            activeDevice === "mobile" ? "375px" : "100%",
          "---preview_mobile_review_header":
            activeDevice === "mobile" ? "20px" : "70px",
          "---stack-mobile_padding":
            activeDevice === "mobile" ? "0px 10px 0px 10px" : "0px",
          "---stack-mobile_width_1024_device":
            activeDevice === "mobile" ? "90%" : "100%",
          "---stack-mobile_width": activeDevice === "mobile" ? "40%" : "100%",
          "---stack-mobile_margin_top":
            activeDevice === "mobile" ? "40px" : "60px",
        }}
      >
        {!imagesReady && (
          <div className="qr-review-reel-loader">
            <div className="qr-review-reel-spinner" />
          </div>
        )}
        <div
          className="qorix-review-reel-secound_container"
          style={{
            opacity: imagesReady ? 1 : 0,
            transition: "opacity 0.4s ease",
            backgroundColor: "#fff",
          }}
        >
          <br></br>
          <br></br>
          <br></br>
          <div className="qorix-review-reel-header">
            <ReaviewHeader
              settings={settings}
              startColor={settings.startColor}
              badgeColor={settings.startColor}
            />
          </div>

          <section
            data-section="qorix-review-reel-widget"
            className={`qorix-review-reel-real-review-section ${activeDevice === "mobile" ? "qorix-review-reel-mobile" : ""}`}
          >
            <div className="qorix-review-reel-swiper-wrapper">
              {/* ── Slide track ── */}
              <div
                ref={wrapperRef}
                className="qorix-review-reel-track-wrapper"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleClickGuard}
                onMouseEnter={() => {
                  isHoveringRef.current = true;
                  clearInterval(autoplayRef.current);
                }}
                onMouseLeave={() => {
                  isHoveringRef.current = false;
                  setAutoplayKey((k) => k + 1);
                }}
              >
                <div
                  ref={trackRef}
                  className="qorix-review-reel-track"
                  onTransitionEnd={handleTransitionEnd}
                >
                  {extSlides.map((review, i) => (
                    <div
                      key={`${review.id}-${i}`}
                      className="qorix-review-reel-slide"
                      style={{ width: slideWidth || "auto" }}
                    >
                      <ReviewCard review={review} settings={settings} />
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Controls (Pagination & Arrows) ── */}
              <div className="qorix-review-reel-controls">
                {showArrowControls && (
                  <button
                    className="qorix-review-reel-swiper-button-prev"
                    aria-label="Previous slide"
                    onClick={handleUserPrev}
                  >
                    <ChevronLeftSvg />
                  </button>
                )}

                {showNavigationDots && slides.length > 0 && (
                  <div className="qorix-review-reel-swiper-pagination">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        className={`qorix-review-reel-pagination-bullet${i === realIndex ? " active" : ""}`}
                        aria-label={`Go to slide ${i + 1}`}
                        onClick={() => goToSlide(i)}
                      />
                    ))}
                  </div>
                )}

                {showArrowControls && (
                  <button
                    className="qorix-review-reel-swiper-button-next"
                    aria-label="Next slide"
                    onClick={handleUserNext}
                  >
                    <ChevronRightSvg />
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
