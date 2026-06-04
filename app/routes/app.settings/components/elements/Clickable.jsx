import { useLocation } from "react-router";

export default function Clickable({ icon, title, url }) {
  const { pathname } = useLocation();
  return (
    <s-clickable
      href={url}
      paddingInline="small"
      paddingBlock="small-200"
      background={pathname == url ? "subdued" : "base"}
      borderRadius="base"
    >
      <s-stack direction="inline" gap="small">
        <s-icon type={icon} />
        <s-text>{title}</s-text>
      </s-stack>
    </s-clickable>
  );
}
