import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import CustomSection from "../../../../components/essentials/CustomSection";
import Text from "../../../../components/essentials/elements/Text";

export default function ColorPicker({ data, onChange, defaultColor }) {
  const [color, setColor] = useState(defaultColor);

  // The parent replaces defaultColor on reset/discard. Keep this component's
  // local state in sync so the swatch and both inputs immediately reflect it.
  useEffect(() => {
    setColor(defaultColor);
  }, [defaultColor]);

  const handleChange = (e) => {
    const value = e.target.value ?? e.currentTarget.value;
    setColor(value);
    onChange?.(value);
  };
  return (
    <CustomSection padding="none small small">
      <Text as="h4">{data?.label}</Text>
      <s-grid gridTemplateColumns="33px 1fr" gap="small" alignItems="center">
        <s-clickable
          command="show"
          commandFor={data?.key}
          borderRadius="small"
          overflow="hidden"
          border="base"
          borderColor="strong"
        >
          <div
            style={{
              width: "calc(33px - 10px)",
              height: "calc(33px - 10px)",
              background: "#fff",
              padding: "4px",
            }}
          >
            <div
              style={{
                background: color,
                position: "relative",
                height: "100%",
                width: "100%",
                borderRadius: "4px",
              }}
            />
          </div>
        </s-clickable>
        <s-popover id={data?.key}>
          <s-box padding="base">
            <s-color-picker value={color} onChange={handleChange} />
          </s-box>
        </s-popover>

        <s-text-field value={color} onChange={handleChange} />
      </s-grid>

      {data?.info && (
        <s-stack paddingBlockStart="small">
          <s-paragraph>{data?.info}</s-paragraph>
        </s-stack>
      )}
    </CustomSection>
  );
}

ColorPicker.propTypes = {
  data: PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    info: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func,
  defaultColor: PropTypes.string.isRequired,
};
