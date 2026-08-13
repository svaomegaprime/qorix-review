import { useState } from "react";

const MAX_LENGTH = 500;

function CopyIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const styles = {
  card: {
    width: "100%",

    marginTop: "30px",
    background: "#ffffff",
    borderRadius: "15px",
    border: "1px solid #e8e8ea",
    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
    padding: "18px",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    boxSizing: "border-box",
  },

  title: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#1a1a1a",
    margin: "0 0 20px 0",
  },

  box: {
    background: "#f6f6f7",
    border: "1px solid #ececee",
    borderRadius: "18px",
    padding: "16px",
    boxSizing: "border-box",
  },

  boxHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 4px 14px 4px",
  },

  boxHeaderLabel: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#1a1a1a",
  },

  counter: {
    fontSize: "13px",
    color: "#9a9aa0",
  },

  textareaWrap: {
    position: "relative",
    background: "#ffffff",
    border: "1px solid #e2e2e5",
    borderRadius: "14px",
  },

  textarea: {
    width: "100%",
    resize: "none",
    padding: "16px 44px 16px 16px",
    fontSize: "13px",
    fontWeight: 500,
    color: "#2b2b30",
    outline: "none",
    border: "none",
    background: "transparent",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    boxSizing: "border-box",
    display: "block",
  },

  copyBtn: {
    position: "absolute",
    top: "14px",
    right: "14px",
    background: "transparent",
    border: "none",
    padding: "4px",
    cursor: "pointer",
    color: "#8a8a90",
    display: "flex",
  },

  helper: {
    marginTop: "16px",
    fontSize: "12px",
    color: "#3a3a3e",
    padding: "0 4px",
  },

  link: {
    color: "#3a3a3e",
    textDecoration: "underline",
  },
};

export default function AdvancedCSS({ css, setCss }) {
  const [copied, setCopied] = useState(false);

  const cssValue = typeof css === "string" ? css : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cssValue);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {}
  };

  return (
    <div
      style={{
        ...styles.card,

        // responsive width
        ...(typeof window !== "undefined" && window.innerWidth <= 1024
          ? {
              maxWidth: "100%",
            }
          : {}),

        ...(typeof window !== "undefined" && window.innerWidth <= 768
          ? {
              padding: "14px",
            }
          : {}),
      }}
    >
      <h2 style={styles.title}>Advanced</h2>

      <div style={styles.box}>
        <div style={styles.boxHeader}>
          <span style={styles.boxHeaderLabel}>Custom CSS</span>

          <span style={styles.counter}>
            {cssValue.length}/{MAX_LENGTH}
          </span>
        </div>

        <div style={styles.textareaWrap}>
          <textarea
            value={cssValue}
            onChange={(e) => setCss?.(e.target.value.slice(0, MAX_LENGTH))}
            placeholder="CSS"
            rows={7}
            spellCheck={false}
            style={styles.textarea}
          />

          <button
            onClick={handleCopy}
            aria-label="Copy CSS"
            style={styles.copyBtn}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        </div>
      </div>

      <p style={styles.helper}>
        Customize widgets with CSS.{" "}
        <a
          target="_blank"
          href="https://qorix-review-docs.nextvence.com/pages/widgets/custom-css-guide"
          style={styles.link}
        >
          Learn more.
        </a>
      </p>
    </div>
  );
}
