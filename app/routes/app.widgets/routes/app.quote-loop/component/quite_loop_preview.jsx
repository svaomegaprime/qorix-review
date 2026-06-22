import { useState, useEffect, useRef, useCallback } from "react";
import ReaviewHeader from "../../../components/elements/WidgetsHeader";

// ── Inject pop-zoom keyframe once ─────────────────────────────────────────────
if (typeof document !== "undefined" && !document.getElementById("__rc_kf")) {
  const st = document.createElement("style");
  st.id = "__rc_kf";
  st.textContent = `
    @keyframes rcPopIn {
      0%   { transform: scale(0.82); }
      55%  { transform: scale(1.08); }
      100% { transform: scale(1);    }
    }
  `;
  document.head.appendChild(st);
}

// ── SVG helpers ───────────────────────────────────────────────────────────────

const StarOrange = ({ startColor }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={startColor} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
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

// ── Default settings ──────────────────────────────────────────────────────────


// ── Card sizes ────────────────────────────────────────────────────────────────

const ACTIVE_W = 450;
const SIDE_W   = 360;
const ACTIVE_H = 573;
const SIDE_H   = 500;
const CARD_GAP = 24;
const STEP     = SIDE_W + CARD_GAP; // px per slide

// ── ReviewCard ────────────────────────────────────────────────────────────────

const ReviewCard = ({ review, isActive, settings }) => {
  const s  = settings ;
  const qc = s?.colors?.QUOTE_MARK_COLOR      || "#34C759";
  const sc = s?.colors?.STAR_COLOR            || "#FF9500";
  const tc = s?.colors?.TEXT_COLOR            || "#1A1A1A";
  const bg = s?.colors?.Card_Background_Color || "#ffffff";

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      padding: "50px 20px 24px",
      background: bg, border: "1px solid #EBEBEB", borderRadius: "16px",
      width: isActive ? `${ACTIVE_W}px` : `${SIDE_W}px`,
      height: isActive ? `${ACTIVE_H}px` : `${SIDE_H}px`,
      boxSizing: "border-box", flexShrink: 0,
      transition: "width 0.45s cubic-bezier(0.4,0,0.2,1), height 0.45s cubic-bezier(0.4,0,0.2,1), box-shadow 0.45s",
      boxShadow: isActive
        ? "0px 1px 2px rgba(199,199,199,0.3), 0px 2px 6px 2px rgba(199,199,199,0.15)"
        : "none",
    }}>
      {s?.showQuoteMarkIcon && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <QuoteIcon quicteIcon={qc} />
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", marginTop: "50px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          {s?.showStarDistribution && (
            <ul style={{ display: "inline-flex", listStyle: "none", padding: 0, margin: 0, gap: "2px" }}>
              {[...Array(5)].map((_, i) => <li key={i}><StarOrange startColor={sc} /></li>)}
            </ul>
          )}
          <h3
  style={{
    fontSize: `${s?.quoteFontSize}px`,
    color: tc,
    textAlign: "center",
    margin: 0,
    fontWeight: 400,
    lineHeight: "29px",
  }}
>
  {review.quote?.length > s?.textLength
    ? review.quote.slice(0, s?.textLength) + "..."
    : review.quote}
</h3>
        </div>

        <div style={{ width: "100%", height: "1px", background: "#F0F0F0", marginTop: "auto", marginBottom: "40px", flexShrink: 0 }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "16px" }}>
          {s?.showMediaAsset && (
            <img src={review.avatar} alt={review.name}
              style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, background: "#eff2f5" }}
            />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {s?.showReviewerName && (
              <p style={{ margin: 0, fontWeight: 500, fontSize: "16px", lineHeight: "20px", color: tc, display: "flex", alignItems: "center", gap: "8px" }}>
                {review.name}
                {s?.showVerifiedBadge && <CheckBadge badgeColor={qc} />}
              </p>
            )}
            {s?.showProductName && (
              <p style={{ margin: 0, fontSize: "16px", lineHeight: "20px", color: tc }}>{review.product}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── NavButton ─────────────────────────────────────────────────────────────────

const NavButton = ({ onClick, direction }) => (
  <button onClick={onClick} aria-label={direction === "prev" ? "Previous" : "Next"}
    style={{
      position: "absolute", top: "50%", transform: "translateY(-50%)",
      [direction === "prev" ? "left" : "right"]: "-22px",
      width: "44px", height: "44px", background: "#fff",
      borderRadius: "99px", border: "none",
      boxShadow: "inset 0px -1px 0px #b5b5b5, inset 0px 0px 0px 1px rgba(0,0,0,0.1), inset 0px 0.5px 0px 1.5px #fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", zIndex: 10,
    }}
  >
    {direction === "prev" ? <ChevronLeft /> : <ChevronRight />}
  </button>
);

// ── Dots ──────────────────────────────────────────────────────────────────────

const Dots = ({ total, active, accentColor }) => (
  <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "8px" }}>
    {[...Array(total)].map((_, i) => (
      <div key={i} style={{
        width: i === active ? "24px" : "8px", height: "8px",
        borderRadius: "99px",
        background: i === active ? (accentColor || "#34C759") : "#C8C8C8",
        transition: "width 0.25s ease, background 0.25s ease",
      }} />
    ))}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

export default function ReviewCarousel({ reviews = REVIEWS, settings ,activeDevice}) {
  const s             = settings;
  const total         = reviews.length;
  const showArrows    = s?.showArrowControls !== false;
  const autoplayDelay = s?.autoSlider ? 3000 : 0;
  const speed         = s?.speed;
  console.log("autoplayDelay", autoplayDelay);
  const accentColor   = s?.colors?.QUOTE_MARK_COLOR || "#34C759";

  const [activeIndex, setActiveIndex] = useState(0);
  const [translateX,  setTranslateX]  = useState(0);
  const [sliding,     setSliding]     = useState(false);
  const [popKey,      setPopKey]      = useState(0); // increments → remounts center card → replays animation

  const slidingRef = useRef(false);
  const dirRef     = useRef(0); // 1 = next, -1 = prev

  // Next: track moves LEFT
  const goNext = useCallback(() => {
    if (slidingRef.current) return;
    slidingRef.current = true;
    dirRef.current = 1;
    setSliding(true);
    setTranslateX(-STEP);
  }, []);

  // Prev: track moves RIGHT
  const goPrev = useCallback(() => {
    if (slidingRef.current) return;
    slidingRef.current = true;
    dirRef.current = -1;
    setSliding(true);
    setTranslateX(STEP);
  }, []);

  // After CSS slide transition: update index, reset position, trigger pop-zoom
  const handleTransitionEnd = useCallback((e) => {
    if (e.propertyName !== "transform") return;
    setActiveIndex(prev => (prev + dirRef.current + total) % total);
    setTranslateX(0);
    setSliding(false);
    slidingRef.current = false;
    setPopKey(k => k + 1); // → center card remounts → @keyframes rcPopIn replays
  }, [total]);

  // Autoplay
  useEffect(() => {
    if (!autoplayDelay || autoplayDelay <= 0) return;
    const id = setInterval(goNext, autoplayDelay);
    return () => clearInterval(id);
  }, [autoplayDelay, goNext]);

  // 5 card slots (offset -2…+2); only ±1 and incoming ±2 are visible
  const cards = [];
  for (let offset = -2; offset <= 2; offset++) {
    const idx = (activeIndex + offset + total) % total;
    const isIncoming =
      (sliding && dirRef.current ===  1 && offset ===  2) ||
      (sliding && dirRef.current === -1 && offset === -2);
    const opacity = Math.abs(offset) <= 1 || isIncoming ? 1 : 0;
    cards.push({ review: reviews[idx], isActive: offset === 0, offset, opacity });
  }

  return (
    <div style={{ background: "#ddd", padding: "40px 0",overflow: "scroll",height: "80vh" }}>
      <section data-section="qorix-review-quoteloop-widget" style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: "40px", padding: "60px 40px 50px",
        maxWidth: `${activeDevice === "mobile" ? "500px" : "1300px"}`, margin: "0 auto",
        textAlign: "center", background: "#fff",
        
      }}>

       <ReaviewHeader settings={settings} /> 
      
        <div style={{ width: "100%", maxWidth: "1240px", position: "relative", margin: "0 auto" }}>

          {/* overflowX:clip clips side cards horizontally; overflowY:visible keeps full card height */}
          <div style={{ overflowX: "clip" , overflowY: "visible" }}>
            <div
              onTransitionEnd={handleTransitionEnd}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: `${CARD_GAP}px`, padding: "20px 0 10px",
                transform: `translateX(${translateX}px)`,
                transition: sliding ? `transform ${speed}ms cubic-bezier(0.4,0,0.2,1)` : "none",
              }}
            >
              {cards.map(({ review, isActive, offset, opacity }) => (
                <div
                  // popKey in key → React remounts center div on each slide → animation restarts
                  key={offset === 0 ? `center-${popKey}` : `side-${offset}`}
                  style={{
                    flexShrink: 0,
                    opacity,
                    transform: isActive ? "scale(1)" : "scale(0.90)",
                    animation: isActive
                      ? "rcPopIn 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards"
                      : "none",
                    transition: isActive ? "none" : "transform 0.45s ease, opacity 0.2s ease",
                    pointerEvents: Math.abs(offset) > 1 ? "none" : "auto",
                  }}
                >
                  <ReviewCard review={review} isActive={isActive} settings={s} />
                </div>
              ))}
            </div>
          </div>

          <Dots total={total} active={activeIndex} accentColor={accentColor} />

          {showArrows && (
            <>
              <NavButton onClick={goPrev} direction="prev" />
              <NavButton onClick={goNext} direction="next" />
            </>
          )}
        </div>
      </section>
    </div>
  );
}



// import { useState, useEffect, useRef } from "react";
// import ReaviewHeader from "../../../components/elements/WidgetsHeader";

// // ── SVG helpers ──────────────────────────────────────────────────────────────
// const StarOrange = ({startColor}) => (
//   <svg width="20" height="20" viewBox="0 0 24 24" fill={startColor} xmlns="http://www.w3.org/2000/svg">
//     <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
//   </svg>
// );

// const StarGreen = () => (
//   <svg width="16" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path d="M9.52 0.855C8.976-0.285 7.356-0.285 6.812 0.855L5.144 4.349L1.306 4.855C0.055 5.02-0.446 6.561 0.469 7.43L3.277 10.096L2.573 13.903C2.342 15.143 3.654 16.096 4.763 15.495L8.166 13.647L11.569 15.495C12.678 16.096 13.99 15.143 13.759 13.903L13.055 10.096L15.863 7.43C16.777 6.561 16.277 5.02 15.026 4.855L11.186 4.349L9.52 0.855Z" fill="#34C759" />
//   </svg>
// );

// const QuoteIcon = ({quicteIcon}) => (
//   <svg width="52" height="37" viewBox="0 0 63 45" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path
//       fillRule="evenodd"
//       clipRule="evenodd"
//       d="M49.7037 12.3436C51.9832 9.15001 56.2917 5.71209 62.1575 2.85004C63.6818 2.10627 62.9942 -0.19902 61.3114 0.0138283C48.987 1.57277 40.9989 6.97039 36.6367 14.9973C35.0143 17.9827 33.995 21.1604 33.4521 24.4043C33.0942 26.543 32.9997 28.1481 32.9997 30.002C32.9997 38.2862 39.7154 45.002 47.9997 45.002C56.284 45.002 62.9997 38.2862 62.9997 30.002C62.9997 21.7177 56.1768 14.9973 48.3362 14.9973C48.7499 13.8616 48.8492 13.5406 49.7037 12.3436ZM16.7037 12.3436C18.9832 9.15001 23.2917 5.71209 29.1575 2.85004C30.6818 2.10627 29.9942 -0.19902 28.3114 0.0138283C15.987 1.57277 7.99887 6.97039 3.63669 14.9973C2.01427 17.9827 0.994953 21.1604 0.452118 24.4043C0.0942116 26.543 -0.000312805 28.1481 -0.000312805 30.002C-0.000312805 38.2862 6.71542 45.002 14.9997 45.002C23.284 45.002 29.9997 38.2862 29.9997 30.002C29.9997 21.7177 23.1768 14.9973 15.3362 14.9973C15.7499 13.8616 15.8492 13.5406 16.7037 12.3436Z"
//       fill="url(#quoteGrad)"
//     />
//     <defs>
//       <linearGradient id="quoteGrad" x1="31.5018" y1="45.002" x2="31.5018" y2="0" gradientUnits="userSpaceOnUse">
//         <stop stopColor={quicteIcon} />
//         <stop offset="1" stopColor={quicteIcon} />
//       </linearGradient>
//     </defs>
//   </svg>
// );

// const CheckBadge = ({badgeColor}) => (
//   <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <circle cx="9" cy="9" r="9" fill={badgeColor} />
//     <path d="M5.21 9L7.74 11.53L12.79 6.47" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//   </svg>
// );

// const VerifiedIcon = () => (
//   <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path
//       d="M15.4734 20.075H2.03711C0.872656 20.075 0.0433588 18.9406 0.399999 17.832L1.81367 13.4148C2.26914 11.9969 3.82031 11.2621 5.20391 11.7992C6.12344 12.1559 7.30508 12.4352 8.75312 12.4352C10.2012 12.4352 11.3828 12.1559 12.3023 11.7992C12.3539 11.7777 12.4098 11.7605 12.4656 11.7434V11.8508C12.4656 14.3902 14.352 16.4957 16.7969 16.8395L17.1148 17.832C17.4672 18.9406 16.6422 20.075 15.4734 20.075ZM8.75742 1.925C6.3125 1.925 4.32734 3.91016 4.32734 6.35508C4.32734 8.8 6.3125 10.7852 8.75742 10.7852C11.2023 10.7852 13.1875 8.8 13.1875 6.35508C13.1875 3.91016 11.2023 1.925 8.75742 1.925ZM21.6824 11.8465C21.6824 14.1539 19.8133 16.0273 17.5016 16.0273C15.1941 16.0273 13.3207 14.1582 13.3207 11.8465C13.3207 9.53477 15.1941 7.66562 17.5016 7.66562C19.809 7.66992 21.6824 9.53906 21.6824 11.8465ZM20.0797 9.88281C19.7832 9.58633 19.302 9.58633 19.0055 9.88281L16.6852 12.2031L16.002 11.5199C15.7055 11.2234 15.2242 11.2234 14.9277 11.5199C14.6312 11.8164 14.6312 12.2977 14.9277 12.5941L16.148 13.8145C16.4445 14.1109 16.9258 14.1109 17.2223 13.8145L20.084 10.9527C20.3762 10.6605 20.3762 10.1793 20.0797 9.88281Z"
//       fill="url(#verifiedGrad)"
//     />
//     <defs>
//       <linearGradient id="verifiedGrad" x1="2.62793" y1="6.21938" x2="16.3352" y2="19.9267" gradientUnits="userSpaceOnUse">
//         <stop stopColor="#34C759" />
//         <stop offset="1" stopColor="#088728" />
//       </linearGradient>
//     </defs>
//   </svg>
// );

// const ChevronLeft = () => (
//   <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path fillRule="evenodd" clipRule="evenodd" d="M12.2805 14.53C12.4209 14.3894 12.4998 14.1987 12.4998 14C12.4998 13.8012 12.4209 13.6106 12.2805 13.47L8.81047 9.99999L12.2805 6.52999C12.5768 6.23369 12.5768 5.75248 12.2805 5.46999C11.9842 5.1875 11.503 5.1875 11.2205 5.46999L7.22047 9.46999C7.08002 9.61062 7.00113 9.80124 7.00113 9.99999C7.00113 10.1987 7.08002 10.3894 7.22047 10.53L11.2205 14.53C11.3611 14.6704 11.5517 14.7493 11.7505 14.7493C11.9492 14.7493 12.1398 14.6704 12.2805 14.53Z" fill="#4A4A4A" />
//   </svg>
// );

// const ChevronRight = () => (
//   <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <path fillRule="evenodd" clipRule="evenodd" d="M7.71953 14.53C7.57908 14.3894 7.50019 14.1987 7.50019 14C7.50019 13.8012 7.57908 13.6106 7.71953 13.47L11.1895 9.99999L7.71953 6.52999C7.42323 6.23369 7.42323 5.75248 7.71953 5.46999C8.01583 5.1875 8.49703 5.1875 8.77953 5.46999L12.7795 9.46999C12.92 9.61062 12.9989 9.80124 12.9989 9.99999C12.9989 10.1987 12.92 10.3894 12.7795 10.53L8.77953 14.53C8.63891 14.6704 8.44828 14.7493 8.24953 14.7493C8.05078 14.7493 7.86016 14.6704 7.71953 14.53Z" fill="#4A4A4A" />
//   </svg>
// );

// // ── Review data ──────────────────────────────────────────────────────────────
// const REVIEWS = [
//   {
//     id: 1,
//     quote: "The quality is outstanding and the attention to detail is incredible. I'll definitely be buying again.",
//     name: "Hasan R.",
//     product: "Vitamin C Serum",
//     avatar: "https://i.pravatar.cc/56?img=11",
//   },
//   {
//     id: 2,
//     quote: "Fast shipping and beautiful packaging. My skin is glowing!",
//     name: "Raju Ahmed",
//     product: "Vitamin C Serum",
//     avatar: "https://i.ibb.co.com/7PwsYSL/raju.jpg",
//   },
//   {
//     id: 3,
//     quote: "Amazing product! The serum feels great on my skin and the customer service is top notch.",
//     name: "Emily Chen",
//     product: "Vitamin C Serum",
//     avatar: "https://i.pravatar.cc/56?img=47",
//   },
// ];

// // ── ReviewCard ───────────────────────────────────────────────────────────────
// const ReviewCard = ({ review, isActive,settings}) => (
 
//   <div
//     style={{
//       display: "flex",
//       flexDirection: "column",
//       padding: "50px 20px 24px",
//       background:`${settings?.colors?.Card_Background_Color}`,
//       border: "1px solid #EBEBEB",
//       borderRadius: "16px",
//       width: isActive ? "450px" : "360px",
//       height: isActive ? "573px" : "500px",
//       boxSizing: "border-box",
//       transition: "width 0.45s cubic-bezier(0.4,0,0.2,1), height 0.45s cubic-bezier(0.4,0,0.2,1), box-shadow 0.45s",
//       boxShadow: isActive
//         ? "0px 1px 2px rgba(199,199,199,0.3), 0px 2px 6px 2px rgba(199,199,199,0.15)"
//         : "none",
//       flexShrink: 0,
//     }}
//   >
//     {/* Quote icon */}
//     {settings?.showQuoteMarkIcon &&  <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
//       <QuoteIcon quicteIcon = {settings?.colors?.QUOTE_MARK_COLOR}/>
//     </div>}
  

//     {/* Card content */}
//     <div style={{ flex: 1, display: "flex", flexDirection: "column", marginTop: "50px" }}>
//       <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
//         {/* Stars */}
//         {settings?.showStarDistribution && <ul style={{ display: "inline-flex", listStyle: "none", padding: 0, margin: 0, gap: "2px" }}>
//           {[...Array(5)].map((_, i) => <li key={i}><StarOrange startColor = {settings?.colors?.STAR_COLOR}/></li>)}
//         </ul>}
       

//         {/* Quote */}
//         <h3
//           style={{
//             fontSize: "24px",
//             color: `${settings?.colors?.TEXT_COLOR}`,
//             textAlign: "center",
//             margin: 0,
//             fontWeight: 400,
//             lineHeight: "29px",
//             display: "-webkit-box",
//             WebkitLineClamp: 3,
//             WebkitBoxOrient: "vertical",
//             overflow: "hidden",
//           }}
//         >
//           {review.quote}
//         </h3>
//       </div>

//       {/* Divider */}
//       <div style={{ width: "100%", height: "1px", background: "#F0F0F0", marginTop: "auto", marginBottom: "40px", flexShrink: 0 }} />

//       {/* Reviewer */}
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", textAlign: "left", gap: "16px" }}>
//         { settings?.showMediaAsset && <img src={review.avatar} alt={review.name} style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover", flexShrink: 0, background: "#eff2f5" }} />}
    
//         <div style={{ display: "flex", flexDirection: "column", gap: "4px", }}>
//           <div>
//                   {settings?.showReviewerName &&<p style={{ margin: 0, fontWeight: 500, fontSize: "16px", lineHeight: "20px", color: `${settings?.colors?.TEXT_COLOR}`, display: "flex", alignItems: "center", gap: "8px" }}>
//                     {review.name}      {settings?.showVerifiedBadge && <CheckBadge  badgeColor = {settings?.colors?.QUOTE_MARK_COLOR}/>}
//                   </p> }

             
              
//           </div>
//         {settings?.showProductName &&      <p style={{ margin: 0, fontSize: "16px", lineHeight: "20px", color: `${settings?.colors?.TEXT_COLOR}` }}>
//             {review.product}
//           </p>}
     
//         </div>
//       </div>
//     </div>
//   </div>
// );

// // ── NavButton ────────────────────────────────────────────────────────────────
// const NavButton = ({ onClick, direction }) => (
//   <button
//     onClick={onClick}
//     aria-label={direction === "prev" ? "Previous" : "Next"}
//     style={{
//       position: "absolute",
//       top: "50%",
//       transform: "translateY(-50%)",
//       [direction === "prev" ? "left" : "right"]: "-22px",
//       width: "44px",
//       height: "44px",
//       background: "#fff",
//       borderRadius: "99px",
//       border: "none",
//       boxShadow: "inset 0px -1px 0px #b5b5b5, inset 0px 0px 0px 1px rgba(0,0,0,0.1), inset 0px 0.5px 0px 1.5px #fff",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       cursor: "pointer",
//       zIndex: 10,
//     }}
//   >
//     {direction === "prev" ? <ChevronLeft /> : <ChevronRight />}
//   </button>
// );

// // ── Main Component ───────────────────────────────────────────────────────────
// export default function ReviewCarousel({ reviews = REVIEWS , settings}) {
//   const [activeIndex, setActiveIndex] = useState(0);
//   const total = reviews.length;


//   const {    showRotate,  showArrowControls}= settings

//   const prev = () => setActiveIndex((i) => (i - 1 + total) % total);
//   const next = () => setActiveIndex((i) => (i + 1) % total);

//   // Build looped display: show active card in center with neighbours
//   const getDisplayOrder = () => {
//     const order = [];
//     for (let i = -2; i <= 2; i++) {
//       const idx = (activeIndex + i + total) % total;
//       order.push({ review: reviews[idx], isActive: i === 0, offset: i });
//     }
//     return order;
//   };

//   return (
//     <div
//     style={
//         {
//             background: "#ddd",
//             padding: "40px 0",
//             height: "700px",
//              overflow: "auto",
//         }
//     }
    
//     >
//           <section
//       data-section="qorix-review-quoteloop-widget"
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         gap: "50px",
//         padding: "80px 40px",
//         maxWidth: "1300px",
        
       
//         margin: "0 auto",
//         textAlign: "center",
//         background: "#fff",
    
//       }}
//     >
//       {/* ── Header ── */}
//                 <ReaviewHeader  settings={settings} />
      


//       {/* ── Carousel ── */}
//       <div style={{ width: "100%", maxWidth: "1240px", position: "relative", margin: "0 auto" }}>
//         {/* Track */}
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             gap: "24px",
//             padding: "20px 0 48px",
//             overflow: "hidden",
//           }}
//         >
//            {getDisplayOrder().map(({ review, isActive, offset }) => (
//             <div
//               key={`${review.id}-${offset}`}
//               style={{
//                 flexShrink: 0,
//                 opacity: Math.abs(offset) > 1 ? 0 : 1,
//                 pointerEvents: Math.abs(offset) > 1 ? "none" : "auto",
//                 transition: "opacity 0.3s",
//               }}
//             >
//               <ReviewCard review={review} isActive={isActive} settings={settings} />
//             </div>
//           ))} 
        
//         </div>

      


//         {/* Nav arrows */}

//         {showArrowControls && (
//           <>         
//           <NavButton onClick={prev} direction="prev"  />
//         <NavButton onClick={next} direction="next" />
//           </>
         
//         )}


//         {/* Dots */}
//         <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "-32px" }}>
//           {reviews.map((_, i) => (
//             <button
//               key={i}
//               onClick={() => setActiveIndex(i)}
//               aria-label={`Go to slide ${i + 1}`}
//               style={{
//                 width: i === activeIndex ? "24px" : "8px",
//                 height: "8px",
//                 borderRadius: "99px",
//                 background: i === activeIndex ? "#34c759" : "#c8c8c8",
//                 border: "none",
//                 padding: 0,
//                 cursor: "pointer",
//                 transition: "background 0.25s, width 0.25s",
//               }}
//             />
//           ))}
//         </div>
//       </div>
//     </section>
//     </div>
  
//   );
// }











