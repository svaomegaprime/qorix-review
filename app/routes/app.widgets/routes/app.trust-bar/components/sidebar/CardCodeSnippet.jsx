import { useState } from "react";
import CustomSection from "../../../../../../components/essentials/CustomSection";
import Text from "../../../../../../components/essentials/elements/Text";
import ArrowUpRight from "../icons/ArroUpRight";
import AdvancedCSS from "../../../../components/elements/AdvanceCSS";

const SNIPPET_CODE = `<div x-data="TrustBar({{ product.id | json }})" x-html="trustBarWidget"></div>`;

export default function CardCodeSnippet({ customCss, handleCssChange }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SNIPPET_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
    shopify.toast.show("Code copied to clipboard");
  };

  return (
    <CustomSection>
      <s-heading>Install ratings on product cards</s-heading>
      <CustomSection margin="15px 0 0" background="#F5F7F9">
        <s-grid gap="small">
          <s-paragraph color="subdued">
            Ratings on product cards require a one-time code snippet added to
            your theme. This only needs to be done once.
          </s-paragraph>
          <CustomSection
            background="#fff"
            borderRadius="8px"
            boxShadow="none"
            borderColor="#b3b3b3"
            padding="small"
          >
            <s-paragraph>{SNIPPET_CODE}</s-paragraph>
            <s-stack alignItems="end">
              <s-button
                icon={copied ? "clipboard-check" : "clipboard"}
                onClick={handleCopy}
              />
            </s-stack>
          </CustomSection>

          <s-ordered-list>
            <s-list-item>Copy the snippet above</s-list-item>
            <s-list-item>
              Go to <strong>Online Store</strong> → <strong>Themes</strong> →{" "}
              <strong>Edit code</strong>
            </s-list-item>
            <s-list-item>
              Open your product card template file and paste the snippet where
              you want ratings to appear
            </s-list-item>
          </s-ordered-list>

          <Text
            as="a"
            href="//qorix-currency-docs.softvenceomega.com"
            target="_blank"
            style={{
              textDecoration: "none",
              fontSize: "15px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
            color="#108848"
          >
            Read full installation guide <ArrowUpRight />
          </Text>
        </s-grid>
      </CustomSection>
      <AdvancedCSS css={customCss} setCss={handleCssChange} />
    </CustomSection>
  );
}
