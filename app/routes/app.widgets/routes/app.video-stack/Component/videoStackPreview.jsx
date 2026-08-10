import { useState, useEffect, useRef } from "react";
import WidthHeader from "../../../components/elements/WidgetsHeader";

// ─── Embedded CSS ─────────────────────────────────────────────────────────────
const STYLES = `

.qorix-review-main-container{
background-color: #ddd;
padding: 50px;
height: 650px;
overflow: scroll;


}


section.qorix-review-video-stack-section {
background-color: #fff;
padding: 80px 0px;
 width: var(---preview_mobile_width, 100%);
margin:var(---preview_mobile_margin, 0 auto);
overflow-x: hidden;

}


[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-carousel {
  width: var(---stack-mobil_carousel, 70%);
  margin: 0 auto;
  position: relative;
  padding-left: 0px;


}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-swiper-clip {
  overflow: hidden;
  width: 100%;
  max-width: 1248px;
  padding: 10px 0;
  margin: 10px auto;
  cursor: grab;
  touch-action: pan-y;
  user-select: none;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-swiper-clip.is-dragging {
  cursor: grabbing;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-swiper {
  overflow: visible !important;
  width: 100%;
  height: 573px;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-swiper .swiper-wrapper {
  position: relative;
  display: block;
  height: 100%;
  transform: none !important;
  align-items: center;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-swiper .swiper-slide {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 270px !important;
  flex-shrink: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition:
    opacity 0.25s ease,
    visibility 0.25s ease,
    transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-swiper .swiper-slide.qorix-review-video-stack-visible-slide {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-swiper .swiper-slide-active {
  justify-content: center;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-swiper .swiper-slide-active ~ .swiper-slide {
  justify-content: center;
}

/* ── Positions -3 / +3 added so visibleCount = 7 works ── */
[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-position--3 {
  transform: translate(-909px, -50%);
  z-index: 0;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-position--2 {
  transform: translate(-667px, -50%);
  z-index: 1;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-position--1 {
  transform: translate(-425px, -50%);
  z-index: 3;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-position-0 {
  transform: translate(-50%, -50%);
  z-index: 5;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-position-1 {
  transform: translate(155px, -50%);
  z-index: 3;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-position-2 {
  transform: translate(397px, -50%);
  z-index: 1;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-position-3 {
  transform: translate(639px, -50%);
  z-index: 0;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  width: 174px;
  height: 473px;
  transition:
    width 0.45s cubic-bezier(0.4, 0, 0.2, 1),
    height 0.45s cubic-bezier(0.4, 0, 0.2, 1),
    filter 0.45s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: width, height, filter;
  filter: brightness(0.7);
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-tier-adjacent .qorix-review-video-stack-card {
  width: 270px;
  height: 500px;
  filter: brightness(0.85);
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-tier-center .qorix-review-video-stack-card {
  width: 270px;
  height: 550px;
  filter: brightness(1);
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  user-select: none;
  pointer-events: none;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-overlay {
  position: absolute;
  inset: 0;
 
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-topbar {
  position: absolute;
  top: 14px;
  left: 14px;
  right: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  background: #fff;
  border-radius: 99px;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-pill span {
  font-size: 14px;
  font-weight: 500;
  color: #303030;
  line-height: 20px;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-play {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
  line-height: 1;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-info {
  position: absolute;
  bottom: 18px;
  left: 14px;
  right: 14px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-card-stars {
  display: flex;
  gap: 2px;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-reviewer {
  display: flex;
  align-items: center;
  gap: 5px;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-name {
  font-size: 20px;
  font-weight: 500;
  color: #fff;
  line-height: 1;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-quote {
  font-size: 14px;
  font-weight: 400;
  color: #fff;
  line-height: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px 4px 8px;
  background: #f2f2f2;
  border-radius: 12px;
  width: fit-content;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-tag span {
  font-size: 14px;
  font-weight: 500;
  color: #303030;
  line-height: 20px;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-nav {
  position: absolute;
  top: var(---nav_top, 50%);
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  box-shadow:
    inset 0px -1px 0px #b5b5b5,
    inset 0px 0px 0px 1px rgba(0, 0, 0, 0.10),
    inset 0px 0.5px 0px 1.5px #fff;
  transition: box-shadow 0.15s ease, opacity 0.15s ease;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-nav:hover {
  box-shadow:
    inset 0px -1px 0px #9a9a9a,
    inset 0px 0px 0px 1px rgba(0, 0, 0, 0.15),
    inset 0px 0.5px 0px 1.5px #fff;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-nav:active {
  opacity: 0.65;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-nav-prev {
  left: var(---nav_prev_left, 50px);
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-nav-next {
  right: var(---nav_next_right, 50px);
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-custom-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 28px;
  width: 100%;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-dot {
  width: 12px;
  height: 5px;
  border: 0;
  border-radius: 99px;
  background: #108848;
  opacity: 0.28;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.2s ease, width 0.2s ease, background 0.2s ease;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-dot.active {
  width: 52px;
  opacity: 1;
}

/* ── Visible count selector (optional UI) ── */
[data-section="qorix-review-video-stack-widget"] .qorix-visible-count-selector {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

[data-section="qorix-review-video-stack-widget"] .qorix-count-btn {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
}

[data-section="qorix-review-video-stack-widget"] .qorix-count-btn-active {
  background: #088728;
  color: #fff;
  border-color: #088728;
}

.qorix-review-video-stack-heading{
  padding-left: var(---heading_mobile_padding, 80px);

}

@media (max-width: 1450px) {

.qorix-review-main-container{
height: 550px;
}

section.qorix-review-video-stack-section {
 width: var(---preview_mobile_width_mobileview_1140_viewport, 100%);
}


}



@media (max-width: 1030px) {
.qorix-review-video-stack-heading{
  padding:30px;

}

section.qorix-review-video-stack-section {
 width: var(---preview_mobile_width_mobileview, 100%);
}


}

@media (max-width: 900px) {
.qorix-review-main-container{
height: 400px;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-nav {
top:100%;
}

section.qorix-review-video-stack-section {

    padding: 40px 0px;

}

}


 @media (max-width: 480px) {
 .qorix-review-main-container {
    background-color: #ddd;
    padding: 12px;
    height: 700px;
    overflow: scroll;
}

.qorix-review-main-container{
height: 500px;
}

[data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-nav-prev {
    left: 8px;
}
    [data-section="qorix-review-video-stack-widget"] .qorix-review-video-stack-nav-next {
    right: 8px;
}

section.qorix-review-video-stack-section {

 width: var(---preview_mobile_width_mobileview, 100%);


}



. }
`;

// ─── Slide data ───────────────────────────────────────────────────────────────

const SLIDES = [
  {
    poster: "https://s3.zenexcloud.com/nextvence/uploads/videos/pv1-2026-07-28-09:11:09-1785208269413.mp4",
    quote: "Absolutely love this cream! My under-eye area feels smoother, softer, and well hydrated.",
    name: "Abdur Razzak",
    duration: "0:28",
    tag: "Hydrating Eye Cream",
  },
  {
    poster: "https://s3.zenexcloud.com/nextvence/uploads/videos/pv3-2026-07-28-09:11:16-1785208276075.mp4",
    quote: "This serum gives my skin a fresh glow and makes my complexion look noticeably brighter.",
    name: "Abir Rayhan",
    duration: "0:28",
    tag: "Vitamin C Serum",
  },
  {
    poster: "https://s3.zenexcloud.com/nextvence/uploads/videos/pv6-2026-07-28-09:13:47-1785208427458.mp4",
    quote: "It removes dirt and makeup effectively without leaving my skin feeling dry or tight.",
    name: "Osman Hasan",
    duration: "0:28",
    tag: "Gentle Facial Cleanser",
  },
  {
    poster: "https://s3.zenexcloud.com/nextvence/uploads/videos/pv8-2026-07-28-09:14:04-1785208444553.mp4",
    quote: "My skin feels deeply moisturized, plump, and comfortable throughout the day.",
    name: "Imran Khan",
    duration: "0:28",
    tag: "Face Moisturizer",
  },
  {
    poster: "https://s3.zenexcloud.com/nextvence/uploads/videos/pv2-2026-07-28-09:11:13-1785208273276.mp4",
    quote: "It has helped improve my skin texture and made my pores appear less noticeable.",
    name: "Tanvir Ahmed",
    duration: "0:28",
    tag: "Niacinamide Serum",
  },
  {
    poster: "https://s3.zenexcloud.com/nextvence/uploads/videos/pv5-2026-07-28-09:11:23-1785208283514.mp4",
    quote: "The lightweight formula feels cooling and instantly calms my dry, irritated skin.",
    name: "Abdur Rahman",
    duration: "0:28",
    tag: "Soothing Aloe Vera Gel",
  }
];

// ─── Predefined visible-count options ──────────────────────────────────────
// Tumi je value gula UI te dekhate chao (dropdown / button) sob eikhane thakbe
const VISIBLE_COUNT_OPTIONS = [3, 5, 7];

// ─── SVG helpers ──────────────────────────────────────────────────────────────
function OrangeStars(startColor) {

  console.log("startColor", startColor?.startColor);
  const path =
    "M9.51964 0.855C8.97604-.285 7.35604-.285 6.81244.855L5.14444 4.3494 1.30564 4.8546C.0552353 5.0202-.446365 6.561.469235 7.4298L3.27724 10.0962 2.57284 13.9026C2.34244 15.1434 3.65404 16.0962 4.76284 15.495L8.16604 13.647 11.5692 15.495C12.678 16.0962 13.9896 15.1434 13.7592 13.9026L13.0548 10.0962 15.8628 7.4298C16.7772 6.561 16.2768 5.0202 15.0264 4.8546L11.1864 4.3494Z";
  return (
    <div className="qorix-review-video-stack-card-stars" aria-label="5 stars">
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="18" height="17" viewBox="0 0 17 16" fill="none">
          <path d={path} fill={startColor?.startColor} />
        </svg>
      ))}
    </div>
  );
}

function VerifiedBadge({ badgeColor }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-label="Verified"
    >
      <circle cx="9" cy="9" r="9" fill={badgeColor} />
      <path
        d="M5 9L7.5 11.5L13 6"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
      <path d="M1 1L9 6L1 11V1Z" fill="#303030" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
      <rect width="3" height="12" fill="#303030" />
      <rect x="7" width="3" height="12" fill="#303030" />
    </svg>
  );
}

function TagPlaceholderIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <rect width="20" height="20" rx="3" fill="#e8e8e8" />
      <rect x="9" y="4" width="2" height="12" rx="1" fill="#888" />
      <rect x="4" y="9" width="12" height="2" rx="1" fill="#888" />
    </svg>
  );
}

// ─── Utility ──────────────────────────────────────────────────────────────────
function getOffset(index, activeIndex, total) {
  let offset = index - activeIndex;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;
  return offset;
}

// visibleCount ekhon 4th argument hisebe ase, default 5 (backward compatible)
function getSlideClassName(index, activeIndex, total, visibleCount = 5) {
  const offset = getOffset(index, activeIndex, total);
  const threshold = Math.floor(visibleCount / 2); // 3->1, 5->2, 7->3

  if (Math.abs(offset) > threshold) return "swiper-slide";

  const tier =
    offset === 0
      ? "qorix-review-video-stack-tier-center"
      : Math.abs(offset) === 1
        ? "qorix-review-video-stack-tier-adjacent"
        : "qorix-review-video-stack-tier-outer";

  return [
    "swiper-slide",
    "qorix-review-video-stack-visible-slide",
    tier,
    `qorix-review-video-stack-position-${offset}`,
  ].join(" ");
}

// ─── ReviewCard ───────────────────────────────────────────────────────────────
function ReviewCard({ slide, displayElements }) {
  const {
    showStarDistribution,
    autoplayOnHover,
    showReviewerName,
    showReviewTextBelow,
    showVerifiedBadge,
    showVideoDuration,
    showProductName,
    mutedByDefault,
    startColor,
    overlayTintColor,
    badgeColor,
  } = displayElements;

  console.log("this is a bange color", badgeColor)
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const config = {
    autoplayOnHover: autoplayOnHover,
    muted: mutedByDefault,
  };

  function handlePlayClick(e) {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.paused ? video.play() : video.pause();
  }

  function handleMouseEnter() {
    if (config.autoplayOnHover) videoRef.current?.play();
  }

  function handleMouseLeave() {
    if (config.autoplayOnHover) videoRef.current?.pause();
  }

  return (
    <div
      className="qorix-review-video-stack-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        className="qorix-review-video-stack-bg"
        src={slide.poster}
        loop={config.loop}
        muted={config.muted}
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <div style={{ backgroundImage: ` linear-gradient(180deg, rgba(0, 0, 0, 0) 30%, ${overlayTintColor})` }} className="qorix-review-video-stack-overlay" />

      <div className="qorix-review-video-stack-topbar">
        {showVideoDuration && (
          <div className="qorix-review-video-stack-pill">
            <span>{slide.duration}</span>
          </div>
        )}

        <button
          className="qorix-review-video-stack-play"
          aria-label={isPlaying ? "Pause video" : "Play video"}
          onClick={handlePlayClick}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>

      <div className="qorix-review-video-stack-info">
        {showStarDistribution && <OrangeStars startColor={startColor} />}
        <div className="qorix-review-video-stack-reviewer">
          {showReviewerName && (
            <span className="qorix-review-video-stack-name">{slide.name}</span>
          )}
          {showVerifiedBadge && <VerifiedBadge badgeColor={badgeColor} />}
        </div>

        {showReviewTextBelow && (
          <p className="qorix-review-video-stack-quote">{slide.quote}</p>
        )}

        {showProductName && (
          <div>
            {slide.tag && (
              <div className="qorix-review-video-stack-tag">
                <TagPlaceholderIcon />
                <span>{slide.tag} </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ReviewVideoStack({ settings, activeDevice }) {
  const [activeIndex, setActiveIndex] = useState(2);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, active: false, hasDragged: false });
  const total = SLIDES.length;

  const {
    // Display elements
    showStarDistribution,
    showReviewerName,
    showReviewTextBelow,
    showVerifiedBadge,
    showVideoDuration,
    showProductName,

    // Video behavior
    showLoopVideo,
    mutedByDefault,
    autoplayOnHover,

    //-------Carousel behavior,
    showNavigationDots,
    showArrowControls,
    thumbnailsShown,

    // color piker
    startColor,
    activeDotColor,
    overlayTintColor,
    badgeColor,

    // ── NEW: predefined visible-count value ashbe settings theke ──
    // jodi settings e na thake, default 5 use hobe

  } = settings;

  // Local fallback state — jodi UI theke direct select korte chao (optional)
  const [localVisibleCount, setLocalVisibleCount] = useState(thumbnailsShown);

  // settings theke value change hole local state o sync hobe
  useEffect(() => {
    setLocalVisibleCount(thumbnailsShown);
  }, [thumbnailsShown]);

  // ✅ review shonkha (total) er cheye beshi kokhono dekhabe na
  const effectiveVisibleCount = Math.min(localVisibleCount, total);

  useEffect(() => {
    if (!showLoopVideo) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 3000);
    return () => clearInterval(timer);
  }, [activeIndex, total, showLoopVideo]);

  function goToVideo(index) {
    setActiveIndex(((index % total) + total) % total);
  }

  function handlePointerDown(e) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    dragRef.current = { startX: e.clientX, active: true, hasDragged: false };
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
  }

  function handlePointerMove(e) {
    if (!dragRef.current.active) return;
    if (Math.abs(e.clientX - dragRef.current.startX) > 6) {
      dragRef.current.hasDragged = true;
    }
  }

  function handlePointerUp(e) {
    if (!dragRef.current.active) return;
    const delta = e.clientX - dragRef.current.startX;
    dragRef.current.active = false;
    setIsDragging(false);
    if (Math.abs(delta) > 50) {
      goToVideo(delta < 0 ? activeIndex + 1 : activeIndex - 1);
    }
  }

  function handleClickGuard(e) {
    if (dragRef.current.hasDragged) {
      e.stopPropagation();
      dragRef.current.hasDragged = false;
    }
  }

  return (
    <>
      <style>{STYLES}</style>

      <div
        className="qorix-review-main-container"
        style={{
          "--color-text-primary": "#303030",
          "--color-text-green": "#008923",
          "--color-text-secondary": "#616161",
          "--color-text-product-name": "#0d2440",
          "---color-text-primary": "#303030",
          "---color-text-green": "#008923",
          "---color-text-secondary": "#616161",
          "---color-text-product-name": "#0d2440",
          "---preview_mobile_width": activeDevice === "mobile" ? "35%" : "auto",
          "---preview_mobile_margin": activeDevice === "mobile" ? "0 auto" : "",
          "---stack-mobil_carousel": activeDevice === "mobile" ? "80%" : "85%",
          "---heading_mobile_padding": activeDevice === "mobile" ? "20px" : "80px",
          "---preview_mobile_width_mobileview": activeDevice === "mobile" ? "100%" : "100%",
          "---preview_mobile_width_mobileview_1140_viewport": activeDevice === "mobile" ? "50%" : "100%",
          "---nav_top": activeDevice === "mobile" ? "100%" : "50%",
          "---nav_prev_left": activeDevice === "mobile" ? "8px" : "50px",
          "---nav_next_right": activeDevice === "mobile" ? "8px" : "50px",

        }}
        data-section="qorix-review-video-stack-widget"
      >
        <section className="qorix-review-video-stack-section">
          <div className="qorix-review-video-stack-heading" >
            <WidthHeader settings={settings} activeDevice={activeDevice} startColor={settings.startColor}
              badgeColor={settings.badgeColor} />
          </div>

          {/* ── Optional: visible-count selector UI (3 / 5 / 7) ──
               Jodi settings panel theke already control hoy, eita remove kore dite paro */}

          <div className="qorix-review-video-stack-carousel">
            <div
              className={`qorix-review-video-stack-swiper-clip${isDragging ? " is-dragging" : ""}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onClick={handleClickGuard}
            >
              <div className="swiper qorix-review-video-stack-swiper">
                <div className="swiper-wrapper">
                  {SLIDES.map((slide, i) => (
                    <div
                      key={i}
                      className={getSlideClassName(
                        i,
                        activeIndex,
                        total,
                        effectiveVisibleCount,
                      )}
                    >
                      <ReviewCard
                        slide={slide}
                        displayElements={{
                          showStarDistribution,
                          showReviewerName,
                          showReviewTextBelow,
                          showVerifiedBadge,
                          showVideoDuration,
                          showProductName,
                          autoplayOnHover,
                          mutedByDefault,
                          startColor,
                          overlayTintColor,
                          badgeColor,

                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {showNavigationDots && (
              <div className="qorix-review-video-stack-custom-pagination">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    style={{ backgroundColor: i === activeIndex ? activeDotColor : "" }}
                    className={`qorix-review-video-stack-dot${i === activeIndex ? " active" : ""}`}
                    data-index={i}
                    aria-label={`Show video ${i + 1}`}
                    onClick={() => goToVideo(i)}
                  />
                ))}
              </div>
            )}

            {showArrowControls && (
              <button
                className="qorix-review-video-stack-nav qorix-review-video-stack-nav-prev"
                aria-label="Previous slide"
                onClick={() => goToVideo(activeIndex - 1)}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12.2805 14.53C12.4209 14.3894 12.4998 14.1987 12.4998 14C12.4998 13.8012 12.4209 13.6106 12.2805 13.47L8.81047 10 12.2805 6.53C12.4209 6.3894 12.4998 6.1987 12.4998 6C12.4998 5.5858 12.1637 5.25 11.7505 5.25C11.5517 5.25 11.3611 5.3296 11.2205 5.47L7.22047 9.47C7.08002 9.6106 7.00113 9.8012 7.00113 10C7.00113 10.1987 7.08002 10.3894 7.22047 10.53L11.2205 14.53C11.3611 14.6704 11.5517 14.7493 11.7505 14.7493C11.9492 14.7493 12.1398 14.6704 12.2805 14.53Z"
                    fill="#4A4A4A"
                  />
                </svg>
              </button>
            )}

            {showArrowControls && (
              <button
                className="qorix-review-video-stack-nav qorix-review-video-stack-nav-next"
                aria-label="Next slide"
                onClick={() => goToVideo(activeIndex + 1)}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7.71953 14.53C7.57908 14.3894 7.50019 14.1987 7.50019 14C7.50019 13.8012 7.57908 13.6106 7.71953 13.47L11.1895 10 7.71953 6.53C7.57908 6.3894 7.50019 6.1987 7.50019 6C7.50019 5.5858 7.83597 5.25 8.24953 5.25C8.44828 5.25 8.63891 5.3296 8.77953 5.47L12.7795 9.47C12.92 9.6106 12.9989 9.8012 12.9989 10C12.9989 10.1987 12.92 10.3894 12.7795 10.53L8.77953 14.53C8.63891 14.6704 8.44828 14.7493 8.24953 14.7493C8.05078 14.7493 7.86016 14.6704 7.71953 14.53Z"
                    fill="#4A4A4A"
                  />
                </svg>
              </button>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
