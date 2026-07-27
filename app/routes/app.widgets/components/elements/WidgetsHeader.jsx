export default function WidgetsHeader({ settings, activeDevice }) {
  const {
    showHeader,
    headerStyle,
    eyebrowLabel,
    heading,
    subheading,
    reviewStats,
  } = settings || {};

  if (!showHeader) return null;
  return (
    <>
      <style>{`
        :root {
          --qr-white: #ffffff;
          --qr-green: #15b046;
          --qr-text-primary: #1a1a1a;
          --qr-text-muted: #555555;
          --qr-font-body: "Inter", sans-serif;
        }
        
        .qr-reviews-header {
          text-align: ${headerStyle === "center" ? "center" : "left"};
          margin-bottom: 50px;
          background: var(--qr-white);
          font-family: var(--qr-font-body);
          width: 100%;
        }

        .qr-reviews-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: var(--qr-green);
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .qr-reviews-title {
          font-size: 36px;
          font-weight: 700;
          color: var(--qr-text-primary);
          line-height: 1.2;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }

        .qr-reviews-subtitle {
          font-size: 16px;
          color: var(--qr-text-muted);
          margin-bottom: 24px;
          font-weight: 400;
        }

        .qr-rating-summary {
          display: inline-flex;
          align-items: center;
          flex-wrap:wrap;
          gap: 10px;
          justify-content: center;
        }

        .qr-rating-stars {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .qr-star-icon {
          display: inline-flex;
          align-items: center;
        }

        .qr-rating-score {
          font-size: 16px;
          font-weight: 700;
          color: var(--qr-text-primary);
          margin-left: 4px;
        }

        .qr-rating-count {
          font-size: 15px;
          color: #666666;
        }

        .qr-rating-divider {
          color: #cccccc;
          font-size: 18px;
          margin: 0 4px;
          font-weight: 300;
        }

        .qr-verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 500;
          color: #555555;
        }

        .qr-verified-icon {
          color: var(--qr-green);
          display: inline-flex;
          align-items: center;
        }

        @media (max-width: 640px) {
          .qr-reviews-title { font-size: 28px; }
          .qr-rating-summary { flex-wrap: wrap; gap: 8px; }
          .qr-rating-divider { display: none; }
        }
      `}</style>

      <div className="qr-reviews-header">
        <span className="qr-reviews-label">{eyebrowLabel}</span>
        <h2 className="qr-reviews-title">{heading}</h2>
        <p className="qr-reviews-subtitle">{subheading}</p>

        <div className="qr-rating-summary">
          {(reviewStats === "Show review count & verified badge" ||
            reviewStats === "Show review count only") && (
            <div style={{ display: "flex" }}>
              <div className="qr-rating-stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="qr-star-icon">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="var(--qr-green)"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </span>
                ))}
              </div>

              <span className="qr-rating-score">4.9</span>
              <span className="qr-rating-count">(2,451 reviews)</span>

              {reviewStats === "Show review count & verified badge" && (
                <span className="qr-rating-divider">|</span>
              )}
            </div>
          )}

          {(reviewStats === "Show review count & verified badge" ||
            reviewStats === "Show verified badge only") && (
            <span className="qr-verified-badge">
              <span className="qr-verified-icon">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  <circle cx="19" cy="14" r="4" fill="var(--qr-green)" />
                  <path
                    d="M17.5 14l1 1 2-2"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </span>
              Verified reviews
            </span>
          )}
        </div>
      </div>
    </>
  );
}
