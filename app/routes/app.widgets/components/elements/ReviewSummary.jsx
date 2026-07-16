import { useRef, useState } from "react";

export const StarSVG = ({ filled, STAR_COLOR,   }) => (
 <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
<path d="M17.8042 6.5968C17.0794 5.0768 14.9194 5.0768 14.1946 6.5968L11.9706 11.256L6.85218 11.9296C5.18498 12.1504 4.51618 14.2048 5.73698 15.3632L9.48098 18.9184L8.54178 23.9936C8.23458 25.648 9.98338 26.9184 11.4618 26.1168L15.9994 23.6528L20.537 26.1168C22.0154 26.9184 23.7642 25.648 23.457 23.9936L22.5178 18.9184L26.2618 15.3632C27.481 14.2048 26.8138 12.1504 25.1466 11.9296L20.0266 11.256L17.8042 6.5968Z" fill={STAR_COLOR}/>
</svg>
);

/**
 * ReviewSummary — the "heading" part of the reviews block:
 * average rating, star row, rating breakdown bars, and the
 * "Reviews with media" carousel (+ its "See all media" grid modal).
 *
 * Fully driven by props — no knowledge of where reviewsData/quickReview
 * come from, so the parent can pass in whatever it likes.
 *
 * Props:
 * - avgRating: string | number            e.g. "4.9"
 * - reviewCount: number                   e.g. 224
 * - ratingBreakdown: [{ star, count, pct }]  5 -> 1, pct is 0-100
 * - media: [{ type: "image"|"video", url, thumb }]
 * - activeDevice: "desktop" | "mobile"
 * - colors: { STAR_COLOR, TEXT_COLOR, Submit_Button_Color, Border_Color }
 * - onWriteReview: () => void             fired when "Write your review" is clicked
 * - onMediaClick: (item) => void          fired when a media thumb is clicked (carousel or modal)
 */
export default function ReviewSummary({
  avgRating,
  reviewCount,
  ratingBreakdown = [],
  media = [],
  activeDevice = "desktop",
  colors = {},
  onWriteReview,
  onMediaClick,
  reviewModelALlData,
}) {
  const [showMediaModal, setShowMediaModal] = useState(false);
  const mediaTrackRef = useRef(null);
  const { isShowStarDistribution, isShowMediaStrip, isShowReviewCount,writeReviewButtonText ,BAR_FILE_COLOR} =
    reviewModelALlData;
  const { STAR_COLOR, TEXT_COLOR, Submit_Button_Color, Border_Color } = colors;

  const scrollMedia = (dir) => {
    if (!mediaTrackRef.current) return;
    mediaTrackRef.current.scrollBy({ left: dir * 180, behavior: "smooth" });
  };

  const handleMediaClick = (item) => {
    setShowMediaModal(false);
    onMediaClick?.(item);
  };
  return (
    <>
      <style>{`
.rv-summary-card {
  display: grid;
  grid-template-columns: ${
    activeDevice === "mobile"
      ? "1fr"
      : isShowStarDistribution && isShowMediaStrip
      ? "198px 350px 630px "    
      : isShowStarDistribution && !isShowMediaStrip
      ? "198px 350px "          
      : !isShowStarDistribution && isShowMediaStrip
      ? "198px 950px minmax(0, 1fr)"             // শুধু media আছে, star নাই -> 3 column
      : "198px max-content"                       // দুটোই নাই -> 2 column, space-between
  };
  gap: ${
    activeDevice === "mobile"
      ? "20px"
      : isShowStarDistribution || isShowMediaStrip
      ? isShowStarDistribution ? "30px" : "100px"
      : "0px"
  };
  align-items: start;
  padding-bottom: 28px;
  margin-bottom: 24px;
  border: 1px solid ${Border_Color || "#e4e5e7"};
  box-sizing: border-box;
  justify-content:space-between;
  width: 100%;
  min-width: 0;
  padding: 40px 30px;
  border-radius: 12px;
  box-shadow: 0px 2px 2px #ddd;
}

        .rv-avg-num {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  
}

.rv-rating {
  font-size: 64px;
  line-height: 1;
  font-weight: 700;
  color: #333;
}

.rv-count {
  font-size: 18px;
  color: #666;
  margin-bottom: 8px;
}

        .rv-summary-left { min-width: 0; flex-shrink: 0; }
        .rv-avg-num { font-size: 44px; font-weight: 700; line-height: 1; color: #1a1a1a; margin-bottom: 6px; }
        .rv-summary-left .rv-stars { display: flex;  padding: 18px 0px;  }
        .rv-count { font-size: 13px; color: #6d7175; margin-bottom: 16px; }
        .rv-write-btn { background: ${Submit_Button_Color}; color: ${TEXT_COLOR}; border: none; border-radius: 6px; padding: 10px 18px; font-size: 14px; font-weight: 500; cursor: pointer; white-space: nowrap; width:100%}

        .rv-summary-mid { min-width: 0; padding-right: 28px; }
        .rv-breakdown-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .rv-breakdown-label { font-size: 13px; color: #444; flex: 0 0 42px; }
        .rv-breakdown-track { flex: 1 1 auto; min-width: 30px; height: 7px; border-radius: 4px; background: #e9e9e9; overflow: hidden; }
        .rv-breakdown-fill { display: block; height: 100%; background: yellow; border-radius: 4px; }
        .rv-breakdown-count { font-size: 13px; color: #6d7175; flex: 0 0 22px; text-align: right; }

        .rv-summary-right { min-width: 0; overflow: hidden; padding-left: 50px;  border-left: 1px solid ${Border_Color || "#e4e5e7"};}
        .rv-media-header { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-bottom: 16px; }
        .rv-media-title { font-size: 15px; font-weight: 700; margin: 0; white-space: nowrap; color: #1a1a1a; }
        .rv-media-see-all { font-size: 13px; color: ${Submit_Button_Color}; text-decoration: none; cursor: pointer; flex-shrink: 0; white-space: nowrap; }
        .rv-media-see-all:hover { text-decoration: underline; }
        .rv-media-carousel { display: flex; align-items: center; min-width: 0; }
        .rv-media-arrow { flex-shrink: 0; width: 30px; height: 30px; border-radius: 50%; border: 1px solid ${Border_Color || "#eee"}; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 15px; color: #444; box-shadow: 0 2px 6px rgba(0,0,0,0.12); }
        .rv-media-arrow:hover { background: #f6f6f7; }
        .rv-media-track { display: flex; gap: 25px; overflow-x: auto; scroll-behavior: smooth; scrollbar-width: none; min-width: 0; flex: 1 1 auto; }
        .rv-media-track::-webkit-scrollbar { display: none; }
        .rv-media-track-item { width: 108px; height: 108px; border-radius: 10px; overflow: hidden; flex-shrink: 0; cursor: pointer; }
        .rv-media-track-item img { width: 100%; height: 100%; object-fit: cover; display: block; }

        /* Media modal (See all media) */
        .rv-media-modal-backdrop { position: fixed; inset: 0; z-index: 9998; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; padding: 24px; }
        .rv-media-modal { background: #fff; border-radius: 12px; width: 100%; max-width: 820px; max-height: 85vh; overflow-y: auto; padding: 24px; position: relative; box-sizing: border-box; }
        .rv-media-modal-title { font-size: 16px; font-weight: 700; margin: 0 0 16px; }
        .rv-media-grid { display: grid; grid-template-columns: repeat(${activeDevice === "mobile" ? 3 : 6}, 1fr); gap: 10px; }
        .rv-media-grid-item { position: relative; aspect-ratio: 1 / 1; border-radius: 8px; overflow: hidden; cursor: pointer; }
        .rv-media-grid-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .rv-media-play-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.28); }
        .rv-media-play-icon { width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.9); display: flex; align-items: center; justify-content: center; font-size: 12px; color: #1a1a1a; padding-left: 2px; }
        .rv-summary-lb-close { position: absolute; top: 14px; right: 14px; width: 32px; height: 32px; border-radius: 50%; background: #fff; border: none; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.25); line-height: 1; }
      
      /* Real responsive breakpoints (viewport-driven) */
@media (max-width: 1450px) {
  .rv-summary-card {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 24px;
    padding: 28px 24px;
  }
    
  .rv-summary-left { grid-column: 1; grid-row: 1; border-left:none;  }
  .rv-summary-mid {
    grid-column: 2;
    grid-row: 1;
    border-right: none;
    border-left: 1px solid ${Border_Color || "#e4e5e7"};
    padding-right: 0;
    padding-left: 24px;
  }

  .rv-summary-right {
    grid-column: 1 / -1;
    grid-row: 2;
    padding-left: 0;
    padding-top: 20px;
    border-top: 1px solid ${Border_Color || "#e4e5e7"};
    border-left: none;
  }
}
@media (max-width: 640px) {
  .rv-summary-card {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    gap: 20px;
    padding: 24px 18px;
  }
  .rv-summary-left { grid-column: 1; grid-row: 1; }
  .rv-summary-mid {
    grid-column: 1;
    grid-row: 2;
    border-left: none;
    border-top: 1px solid ${Border_Color || "#e4e5e7"};
    padding-left: 0;
    padding-top: 20px;
  }
  .rv-summary-right {
    grid-column: 1;
    grid-row: 3;
    border-lereft: none;
  }
  .rv-media-track-item { width: 84px; height: 84px; }
}
      
      
      `}</style>

      <div className="rv-summary-card">
        <div className="rv-summary-left">
          <div className="rv-avg-num">
            <span className="rv-rating">{avgRating}</span>

            {isShowReviewCount && (
              <span className="rv-count">({reviewCount} reviews)</span>
            )}
          </div>
          <div className="rv-stars">
            {[1, 2, 3, 4, 5].map((s) => (
              <StarSVG
                key={s}
                filled={s <= Math.round(Number(avgRating))}
                STAR_COLOR={STAR_COLOR}
                size={18}
              />
            ))}
          </div>

          <button className="rv-write-btn" onClick={() => onWriteReview?.()}>
           {writeReviewButtonText}
          </button>
        </div>
        {isShowStarDistribution && (
          <div className="rv-summary-mid">

            {ratingBreakdown.map(({ star, count, pct }) => (
              <div className="rv-breakdown-row" key={star}>
                <span className="rv-breakdown-label">{star} star</span>
                <span className="rv-breakdown-track">
                  <span
                    className="rv-breakdown-fill"
                    style={{
                      width: `${count > 0 ? Math.max(pct, 4) : 0}%`,
                      background: BAR_FILE_COLOR,
                    }}
                  />
                </span>

                <span className="rv-breakdown-count">{count}</span>
              </div>
            ))}
          </div>
        )}

        {media.length > 0 && isShowMediaStrip && (
          <div className="rv-summary-right">
            <div className="rv-media-header">
              <p className="rv-media-title">Reviews with media</p>
              <span
                className="rv-media-see-all"
                onClick={() => setShowMediaModal(true)}
              >
                See all media
              </span>
            </div>
            <div className="rv-media-carousel">
              <button
                className="rv-media-arrow"
                onClick={() => scrollMedia(-1)}
                aria-label="Scroll left"
              >
                ‹
              </button>
              <div className="rv-media-track" ref={mediaTrackRef}>
                {media.map((item, i) => (
                  <div
                    className="rv-media-track-item"
                    key={i}
                    onClick={() => onMediaClick?.(item)}
                  >
                    <img
                      src={item.type === "video" ? item.thumb : item.url}
                      alt={`media-${i}`}
                    />
                  </div>
                ))}
              </div>
              <button
                className="rv-media-arrow"
                onClick={() => scrollMedia(1)}
                aria-label="Scroll right"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* See all media modal */}
      {showMediaModal && (
        <div
          className="rv-media-modal-backdrop"
          onClick={() => setShowMediaModal(false)}
        >
          <div className="rv-media-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="rv-summary-lb-close"
              onClick={() => setShowMediaModal(false)}
            >
              ×
            </button>
            <p className="rv-media-modal-title">Reviews with media</p>
            <div className="rv-media-grid">
              {media.map((item, i) => (
                <div
                  key={i}
                  className="rv-media-grid-item"
                  onClick={() => handleMediaClick(item)}
                >
                  <img
                    src={item.type === "video" ? item.thumb : item.url}
                    alt={`all-media-${i}`}
                  />
                  {item.type === "video" && (
                    <div className="rv-media-play-overlay">
                      <div className="rv-media-play-icon">▶</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
