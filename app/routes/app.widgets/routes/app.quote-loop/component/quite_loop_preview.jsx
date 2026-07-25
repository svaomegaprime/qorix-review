import { useState, useEffect, useRef, useCallback } from "react";
import ReaviewHeader from "../../../components/elements/WidgetsHeader";

// ── SVG helpers ───────────────────────────────────────────────────────────────

const StarOrange = ({ startColor }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill={startColor}>
    <path d="M9.51964 0.855C8.97604 -0.285 7.35604 -0.285 6.81244 0.855L5.14444 4.3494L1.30564 4.8546C0.0552353 5.0202 -0.446365 6.561 0.469235 7.4298L3.27724 10.0962L2.57284 13.9026C2.34244 15.1434 3.65404 16.0962 4.76284 15.495L8.16604 13.647L11.5692 15.495C12.678 16.0962 13.9896 15.1434 13.7592 13.9026L13.0548 10.0962L15.8628 7.4298C16.7772 6.561 16.2768 5.0202 15.0264 4.8546L11.1864 4.3494L9.51964 0.855Z" fill="#FF9500"/>
  </svg>
);

const QuoteIcon = ({ quicteIcon }) => (
  <svg width="52" height="37" viewBox="0 0 63 45" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M49.7037 12.3436C51.9832 9.15001 56.2917 5.71209 62.1575 2.85004C63.6818 2.10627 62.9942 -0.19902 61.3114 0.0138283C48.987 1.57277 40.9989 6.97039 36.6367 14.9973C35.0143 17.9827 33.995 21.1604 33.4521 24.4043C33.0942 26.543 32.9997 28.1481 32.9997 30.002C32.9997 38.2862 39.7154 45.002 47.9997 45.002C56.284 45.002 62.9997 38.2862 62.9997 30.002C62.9997 21.7177 56.1768 14.9973 48.3362 14.9973C48.7499 13.8616 48.8492 13.5406 49.7037 12.3436ZM16.7037 12.3436C18.9832 9.15001 23.2917 5.71209 29.1575 2.85004C30.6818 2.10627 29.9942 -0.19902 28.3114 0.0138283C15.987 1.57277 7.99887 6.97039 3.63669 14.9973C2.01427 17.9827 0.994953 21.1604 0.452118 24.4043C0.0942116 26.543 -0.000312805 28.1481 -0.000312805 30.002C-0.000312805 38.2862 6.71542 45.002 14.9997 45.002C23.284 45.002 29.9997 38.2862 29.9997 30.002C29.9997 21.7177 23.1768 14.9973 15.3362 14.9973C15.7499 13.8616 15.8492 13.5406 16.7037 12.3436Z"
      fill={quicteIcon}
    />
  </svg>
);

const CheckBadge = ({ badgeColor }) => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="9" r="9" fill={badgeColor} />
    <path d="M5.21 9L7.74 11.53L12.79 6.47" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronLeft = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M12.2805 14.53C12.4209 14.3894 12.4998 14.1987 12.4998 14C12.4998 13.8012 12.4209 13.6106 12.2805 13.47L8.81047 9.99999L12.2805 6.52999C12.5768 6.23369 12.5768 5.75248 12.2805 5.46999C11.9842 5.1875 11.503 5.1875 11.2205 5.46999L7.22047 9.46999C7.08002 9.61062 7.00113 9.80124 7.00113 9.99999C7.00113 10.1987 7.08002 10.3894 7.22047 10.53L11.2205 14.53C11.3611 14.6704 11.5517 14.7493 11.7505 14.7493C11.9492 14.7493 12.1398 14.6704 12.2805 14.53Z" fill="#4A4A4A" />
  </svg>
);

const ChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M7.71953 14.53C7.57908 14.3894 7.50019 14.1987 7.50019 14C7.50019 13.8012 7.57908 13.6106 7.71953 13.47L11.1895 9.99999L7.71953 6.52999C7.42323 6.23369 7.42323 5.75248 7.71953 5.46999C8.01583 5.1875 8.49703 5.1875 8.77953 5.46999L12.7795 9.46999C12.92 9.61062 12.9989 9.80124 12.9989 9.99999C12.9989 10.1987 12.92 10.3894 12.7795 10.53L8.77953 14.53C8.63891 14.6704 8.44828 14.7493 8.24953 14.7493C8.05078 14.7493 7.86016 14.6704 7.71953 14.53Z" fill="#4A4A4A" />
  </svg>
);

// ── Review data ───────────────────────────────────────────────────────────────

const REVIEWS = [
  { id: 1, quote: "The quality is outstanding and the attention to detail is incredible. I'll definitely be buying again.", name: "Hasan R.",   product: "Vitamin C Serum", avatar: "https://i.pravatar.cc/56?img=11" },
  { id: 2, quote: "Fast shipping and beautiful packaging. My skin is glowing after just two weeks!",                      name: "Raju Ahmed", product: "Vitamin C Serum", avatar: "https://i.pravatar.cc/56?img=22" },
  { id: 3, quote: "Amazing product! The serum feels great on my skin and the customer service is top notch.",            name: "Emily Chen", product: "Vitamin C Serum", avatar: "https://i.pravatar.cc/56?img=47" },
  { id: 4, quote: "Absolutely love this. My skin feels smoother and more radiant than ever before.",                     name: "Sarah M.",   product: "Vitamin C Serum", avatar: "https://i.pravatar.cc/56?img=32" },
  { id: 5, quote: "High quality and amazing results. Would definitely recommend to anyone!",                             name: "James K.",   product: "Vitamin C Serum", avatar: "https://i.pravatar.cc/56?img=60" },
];

// ── Card sizes / layout math ─────────────────────────────────────────────────
// (unchanged logic — ReviewCard always renders at ACTIVE size, side look is
// produced purely by a transform: scale() on the wrapper slot, and every
// card is keyed by review.id so it animates continuously, never "swaps".)

const ACTIVE_W = 450;
const SIDE_W   = 360;
const ACTIVE_H = 573;
const CARD_GAP = 24;

const SIDE_SCALE = SIDE_W / ACTIVE_W; // ≈ 0.8

const ACTIVE_HALF = ACTIVE_W / 2;
const SIDE_HALF   = SIDE_W / 2;

const STEP_CENTER_TO_SIDE = ACTIVE_HALF + SIDE_HALF + CARD_GAP; // center ↔ ±1
const STEP_SIDE_TO_SIDE   = SIDE_HALF + SIDE_HALF + CARD_GAP;   // ±1 ↔ ±2

function offsetForPos(pos) {
  const n = Math.abs(pos);
  if (n === 0) return 0;
  let dist = STEP_CENTER_TO_SIDE;
  if (n > 1) dist += (n - 1) * STEP_SIDE_TO_SIDE;
  return Math.sign(pos) * dist;
}

function relativePosition(index, activeIndex, total) {
  let diff = (index - activeIndex) % total;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;
  return diff;
}

// ── Stylesheet ────────────────────────────────────────────────────────────────
// Everything STATIC (doesn't depend on per-render/per-index values) lives
// here as real CSS classes. Only truly dynamic values — colors coming from
// `settings`, and each card's own slide/zoom transform (which depends on
// its live position) — are passed in via inline style / CSS custom
// properties, since a static stylesheet can't express "whichever card is
// currently active."

const CAROUSEL_CSS = `
.qrx-wrapper {
  background: #ddd;
  padding: 60px 60px;
  overflow: scroll;
  height: 650px;
}

.qrx-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  padding: 60px;

  margin: 0 auto;
  text-align: center;
  background: #fff;
  width: 90%;
}

.qrx-section--mobile {
  max-width: 500px;
}

.qrx-track-container {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  position: relative;
}

.qrx-viewport {
  overflow: hidden;
  position: relative;
  height: ${ACTIVE_H + 20}px;
}

.qrx-card-slot {
  position: absolute;
  top: 50%;
  left: 50%;
  transition: transform var(--qrx-speed, 450ms) cubic-bezier(0.22, 1, 0.36, 1),
              opacity var(--qrx-speed, 450ms) ease;
  will-change: transform, opacity;
}

.qrx-card {
  display: flex;
  flex-direction: column;
  padding: 50px 20px 24px;
  width: ${ACTIVE_W}px;
  height: ${ACTIVE_H}px;
  box-sizing: border-box;
  flex-shrink: 0;
  border-radius: 16px;
  border: 1px solid #EBEBEB;
  background: var(--qrx-card-bg, #ffffff);
  transition: box-shadow 0.45s;
  box-shadow: none;
}

.qrx-card--active {
  box-shadow: 0px 1px 2px rgba(199,199,199,0.3), 0px 2px 6px 2px rgba(199,199,199,0.15);
}

.qrx-card-quote-icon-row {
  display: flex;
  justify-content: center;
  align-items: center;
}

.qrx-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 50px;
}

.qrx-card-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.qrx-card-stars {
  display: inline-flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 8px;
}

.qrx-card-quote {
  font-size: var(--qrx-quote-font-size, 20px);
  color: var(--qrx-text-color, #1A1A1A);
  text-align: center;
  margin: 0;
  font-weight: 400;
  line-height: 29px;
}

.qrx-card-divider {
  width: 100%;
  height: 1px;
  background: #F0F0F0;
  margin-top: auto;
  margin-bottom: 40px;
  flex-shrink: 0;
}

.qrx-card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
}

.qrx-card-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: #eff2f5;
}

.qrx-card-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.qrx-card-name {
  margin: 0;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  color: var(--qrx-text-color, #1A1A1A);
  display: flex;
  align-items: center;
  gap: 8px;
}

.qrx-card-product {
  margin: 0;
  font-size: 16px;
  line-height: 20px;
  color: var(--qrx-text-color, #1A1A1A);
}

.qrx-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  background: #fff;
  border-radius: 99px;
  border: none;
  box-shadow: inset 0px -1px 0px #b5b5b5, inset 0px 0px 0px 1px rgba(0,0,0,0.1), inset 0px 0.5px 0px 1.5px #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
}

.qrx-nav-btn--prev { left: -22px; }
.qrx-nav-btn--next { right: -22px; }

.qrx-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
}

.qrx-dot {
  width: 8px;
  height: 8px;
  border-radius: 99px;
  background: #C8C8C8;
  transition: width 0.25s ease, background 0.25s ease;
}

.qrx-dot--active {
  width: 24px;
  background: #34C759;
}


@media (max-width: 1450px) {
  .qrx-wrapper {
    overflow-y: auto;
      overflow-x: hidden;
   padding: 60px 80px 60px 70px;
  }
}

@media (max-width: 1030px) {
  .qrx-section {
    width: 80%;
  }

  .qrx-wrapper {
    padding-left: 40px;
    padding-right: 50px;
     height: 500px;
  }

  .qrx-card {
    width: 384px;
  }
}

@media (max-width: 500px) {
  .qrx-section {
    width: 75%;
    gap:20px;
  }
.qrx-section{
padding:41px;
}
  .qrx-wrapper {
    padding-left: 5px;
    padding-right: 5px;
    padding-top: 20px;
    overflow-y: auto;
    overflow-x: hidden;
    height: 500px;
  }

  .qrx-card {
    width: 280px;
  }
}

`;

// ── ReviewCard ────────────────────────────────────────────────────────────────

const ReviewCard = ({ review, isActive, settings }) => {
  const s  = settings;
  const qc = s?.colors?.QUOTE_MARK_COLOR      || s?.quoteMarkColor      || "#1D9E75";
  const sc = s?.colors?.STAR_COLOR            || s?.starColor           || "#F59E0B";
  const tc = s?.colors?.TEXT_COLOR            || s?.textColor           || "#303030";
  const bg = s?.colors?.Card_Background_Color || s?.cardBackgroundColor || "#FFFFFF";

  return (
    <div
      className={`qrx-card${isActive ? " qrx-card--active" : ""}`}
      style={{
        "--qrx-card-bg": bg,
        "--qrx-text-color": tc,
        "--qrx-quote-font-size": `${s?.quoteFontSize}px`,
      }}
    >
      {s?.showQuoteMarkIcon && (
        <div className="qrx-card-quote-icon-row">
          <QuoteIcon quicteIcon={qc} />
        </div>
      )}

      <div className="qrx-card-body">
        <div className="qrx-card-top">
          {s?.showStarDistribution && (
            <ul className="qrx-card-stars">
              {[...Array(5)].map((_, i) => <li key={i}><StarOrange startColor={sc} /></li>)}
            </ul>
          )}
          <h3 className="qrx-card-quote">
            {review.quote?.length > s?.textLength
              ? review.quote.slice(0, s?.textLength) + "..."
              : review.quote}
          </h3>
        </div>

        <div className="qrx-card-divider" />

        <div className="qrx-card-footer">
          {s?.showMediaAsset && (
            <img className="qrx-card-avatar" src={review.avatar} alt={review.name} />
          )}
          <div className="qrx-card-meta">
            {s?.showReviewerName && (
              <p className="qrx-card-name">
                {review.name}
                {s?.showVerifiedBadge && <CheckBadge badgeColor={qc} />}
              </p>
            )}
            {s?.showProductName && (
              <p className="qrx-card-product">{review.product}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── NavButton ─────────────────────────────────────────────────────────────────

const NavButton = ({ onClick, direction }) => (
  <button
    onClick={onClick}
    aria-label={direction === "prev" ? "Previous" : "Next"}
    className={`qrx-nav-btn ${direction === "prev" ? "qrx-nav-btn--prev" : "qrx-nav-btn--next"}`}
  >
    {direction === "prev" ? <ChevronLeft /> : <ChevronRight />}
  </button>
);

// ── Dots ──────────────────────────────────────────────────────────────────────

const Dots = ({ total, active }) => (
  <div className="qrx-dots">
    {[...Array(total)].map((_, i) => (
      <div key={i} className={`qrx-dot${i === active ? " qrx-dot--active" : ""}`} />
    ))}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

export default function ReviewCarousel({ reviews = REVIEWS, settings, activeDevice }) {
  const s             = settings;
  const total         = reviews.length;
  const showArrows    = s?.showArrowControls !== false;
  const autoplayDelay = s?.autoSlider ? 3000 : 0;
  const speed         = s?.speed || 450; // shared duration for every card's transform

  const [activeIndex, setActiveIndex] = useState(0);
  const lockRef = useRef(false); // simple click-lock while an animation is running

  const goNext = useCallback(() => {
    if (lockRef.current) return;
    lockRef.current = true;
    setActiveIndex(prev => (prev + 1) % total);
    setTimeout(() => { lockRef.current = false; }, speed);
  }, [total, speed]);

  const goPrev = useCallback(() => {
    if (lockRef.current) return;
    lockRef.current = true;
    setActiveIndex(prev => (prev - 1 + total) % total);
    setTimeout(() => { lockRef.current = false; }, speed);
  }, [total, speed]);

  // Autoplay
  useEffect(() => {
    if (!autoplayDelay || autoplayDelay <= 0) return;
    const id = setInterval(goNext, autoplayDelay);
    return () => clearInterval(id);
  }, [autoplayDelay, goNext]);

  

  return (
    <>
      <style>{CAROUSEL_CSS}</style>
      <div className="qrx-wrapper">
        <section
          data-section="qorix-review-quoteloop-widget"
          className={`qrx-section${activeDevice === "mobile" ? " qrx-section--mobile" : ""}`}
        >
          <ReaviewHeader settings={settings} />

          <div className="qrx-track-container">
            {/* card viewport hides outgoing slides */}
            <div className="qrx-viewport">
              {reviews.map((review, index) => {
                const pos      = relativePosition(index, activeIndex, total); // -2..2, continuous per card
                const isActive = pos === 0;
                const visible  = Math.abs(pos) <= 1; // only center + immediate neighbors shown

                return (
                  <div
                    key={review.id}
                    className="qrx-card-slot"
                    style={{
                      "--qrx-speed": `${speed}ms`,
                      opacity: visible ? 1 : 0,
                      transform: `translate(calc(-50% + ${offsetForPos(pos)}px), -50%) scale(${isActive ? 1 : SIDE_SCALE})`,
                      pointerEvents: visible ? "auto" : "none",
                      zIndex: total - Math.abs(pos), // active card stacks above its neighbors
                    }}
                  >
                    <ReviewCard review={review} isActive={isActive} settings={s} />
                  </div>
                );
              })}
            </div>

            {showArrows && (
              <>
                <NavButton onClick={goPrev} direction="prev" />
                <NavButton onClick={goNext} direction="next" />
              </>
            )}

            <Dots total={total} active={activeIndex} />
          </div>
        </section>
      </div>
    </>
  );
}


