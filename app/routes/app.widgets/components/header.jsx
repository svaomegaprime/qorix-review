import { useState } from "react";

export default function Header({ handleSettingChange, settings }) {
  const {
    showHeader,
    headerStyle,
    eyebrowLabel,
    heading,
    subheading,
    reviewStats,
  } = settings;



  const [isOpen, setIsOpen] = useState(showHeader);
 
  const headerStyleBoxStyle = (styleKey) => ({
    display: "flex",
    height: "80px",
    border:
      headerStyle === styleKey ? "3px solid #78f7b3f8" : "1px solid #ccc",
    borderRadius: "10px",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  });

  return (
    <div>
      
      <s-section>
        <s-stack>
          <s-stack
            direction="inline"
            gap="base"
            justifyContent="space-between"
            alignItems="center"
          >
            <s-heading>Header </s-heading>
            <s-icon
              onClick={() => setIsOpen(!isOpen)}
              type="caret-down"
            ></s-icon>
          </s-stack>

          {isOpen && (
            <div>
              <s-stack>
                <s-stack gap="small" paddingBlockStart="small">
                  <s-switch
                    id="show-header-switch"
                    label="Show header"
                    checked={showHeader}
                    onChange={(e) =>
                      handleSettingChange("showHeader", e.target.checked)
                    }
                  ></s-switch>
                </s-stack>

                <s-stack gap="small" paddingBlockStart="small"></s-stack>
                <s-stack
                  border="base"
                  paddingInlineStart="small"
                  borderRadius="base"
                  padding="small"
                >
                  <s-heading level="4">Header style</s-heading>

                  <s-grid
                    gridTemplateColumns="repeat(2, 1fr)"
                    gap="small"
                    paddingBlockStart="small"
                  >
                    <div
                      style={headerStyleBoxStyle("center")}
                      onClick={() => handleSettingChange("headerStyle", "center")}
                    >
                      <s-stack
                        direction="inline"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <s-icon type="text-align-center"></s-icon>
                        <s-paragraph>Center</s-paragraph>
                      </s-stack>
                    </div>

                    <div
                      style={headerStyleBoxStyle("left")}
                      onClick={() => handleSettingChange("headerStyle", "left")}
                    >
                      <s-stack
                        direction="inline"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <s-icon type="text-align-left"></s-icon>
                        <s-paragraph>Left</s-paragraph>
                      </s-stack>
                    </div>
                  </s-grid>
                </s-stack>

                <s-stack gap="small" paddingBlockStart="small"></s-stack>
                <s-stack
                  border="base"
                  paddingInlineStart="small"
                  borderRadius="base"
                  padding="small"
                >
                  <s-text-field
                    label="Eyebrow label"
                    maxLength="30"
                    value={eyebrowLabel}
                    onChange={(e) =>
                      handleSettingChange("eyebrowLabel", e.target.value)
                    }
                  ></s-text-field>
                </s-stack>

                <s-stack gap="small" paddingBlockStart="small"></s-stack>
                <s-stack
                  border="base"
                  paddingInlineStart="small"
                  borderRadius="base"
                  padding="small"
                >
                  <s-text-field
                    label="Heading"
                                        maxLength="50"

                    value={heading}
                    onChange={(e) =>
                      handleSettingChange("heading", e.target.value)
                    }
                  ></s-text-field>
                </s-stack>

                <s-stack gap="small" paddingBlockStart="small"></s-stack>
                <s-stack
                  border="base"
                  paddingInlineStart="small"
                  borderRadius="base"
                  padding="small"
                >
                  <s-text-field
                    label="Subheading"
                     maxLength="100"

                    value={subheading}
                    onChange={(e) =>
                      handleSettingChange("subheading", e.target.value)
                    }
                  ></s-text-field>
                </s-stack>

                <s-stack gap="small" paddingBlockStart="small"></s-stack>
                <s-stack
                  border="base"
                  paddingInlineStart="small"
                  borderRadius="base"
                  padding="small"
                >
                  <s-select
                    label="Review stats"
                    value={reviewStats}
                    onChange={(e) =>
                      handleSettingChange("reviewStats", e.target.value)
                    }
                  >
                    <s-option value="Show review count & verified badge">
                      Show review count & verified badge
                    </s-option>
                    <s-option value="Show verified badge only">
                      Show verified badge only
                    </s-option>
                    <s-option value="Show review count only">
                      Show review count only
                    </s-option>
                  </s-select>
                </s-stack>
              </s-stack>
            </div>
          )}
        </s-stack>
      </s-section>
    </div>
  );
}