import Text from "./elements/Text";

function componentName({
  text = "Upgrade Plan",
  navigate = "/app/manage-plan",
}) {
  return (
    <button
      type="button"
      onClick={() => navigate(navigate)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        backgroundColor: "#FEF3C7",
        color: "#92400E",
        border: "1px solid #FCD34D",
        padding: "7px 14px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
        lineHeight: 1,
      }}
    >
      <span style={{ fontSize: "14px", lineHeight: 1, display: "inline-flex" }}>
        👑
      </span>
      <Text as="span" variant="bodySm" fontWeight="bold">
       {text}
      </Text>
    </button>
  );
}

export default componentName;
