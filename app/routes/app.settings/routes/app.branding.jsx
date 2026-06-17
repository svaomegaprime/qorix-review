import { useState } from "react";
import CustomGridSection from "../../../components/essentials/CustomGridSection";
import CustomSection from "../../../components/essentials/CustomSection";
import Text from "../../../components/essentials/elements/Text";
import { DEFAULT_BRANDING } from "../data/defaultData";
import { handleStateUpdate } from "../utils/client/utils.client";
import ColorPicker from "../../../routes/app.widgets/components/elements/ColorPicker";
import BrandingEmailPreview from "../components/essentials/BrandingEmailPreview";

const brandingColorSettings = [
  {
    key: "emailPrimaryButtonColor",
    label: "Primary/button color",
  },
  {
    key: "emailButtonTextColor",
    label: "Button text color",
  },
  {
    key: "emailBackgroundColor",
    label: "Email background",
  },
  {
    key: "emailHeadingColor",
    label: "Heading color",
  },
  {
    key: "emailBodyTextColor",
    label: "Body text color",
  },
  {
    key: "emailAccentBorderColor",
    label: "Accent/border color",
  },
];
export default function Branding() {
  const [brandSettings, setBrandSettings] = useState(DEFAULT_BRANDING);

  return (
    <>
      <pre>{JSON.stringify(brandSettings, null, 2)}</pre>

      <s-box>
        <Text>Branding</Text>
        <s-text>
          Customize your logo and brand appearance in review emails
        </s-text>
      </s-box>
      <s-query-container>
        <s-grid
          paddingBlockStart="base"
          gridTemplateColumns="@container (inline-size > 800px) '1.7fr 1.3fr', 1fr"
          gap="small"
          alignItems="start"
        >
          <CustomSection background="#ffffff">
            <CustomSection padding="0">
              <CustomGridSection
                heading="Store identity"
                description="Basic information that appears in email headers and footers."
              >
                <CustomSection>
                  <s-grid gap="small">
                    <s-text-field
                      label="Store display name *"
                      details="This name appears in email headers and subject lines."
                      defaultValue={brandSettings.storeDisplayName}
                      onInput={(e) =>
                        handleStateUpdate(
                          setBrandSettings,
                          "storeDisplayName",
                          e.target.value,
                        )
                      }
                    />
                    <s-divider />
                    <s-text-field
                      label="Sender name *"
                      details="Use a personal name to increase open rates (e.g. “Osman from Glow Store”)."
                      defaultValue={brandSettings.storeSenderName}
                      onInput={(e) =>
                        handleStateUpdate(
                          setBrandSettings,
                          "storeSenderName",
                          e.target.value,
                        )
                      }
                    />
                    <s-divider />
                    <s-text-field
                      label="Store website URL (optional)"
                      placeholder="https://www.glowstore.com"
                      details="This link appears in the email footer."
                      defaultValue={brandSettings.storeWebsiteURL}
                      onInput={(e) =>
                        handleStateUpdate(
                          setBrandSettings,
                          "storeWebsiteURL",
                          e.target.value,
                        )
                      }
                    />
                    <s-divider />
                    <s-text-field
                      label="Store tagline (optional)"
                      placeholder="Skincare that makes you glow"
                      details="A short tagline shown below the store name."
                      defaultValue={brandSettings.storeTagline}
                      onInput={(e) =>
                        handleStateUpdate(
                          setBrandSettings,
                          "storeTagline",
                          e.target.value,
                        )
                      }
                    />
                    <s-divider />

                    <s-text-field
                      label="Reply-to email *"
                      details="Replies to any email will be sent to this email address."
                      defaultValue={brandSettings.storeReplyToEmail}
                      onInput={(e) =>
                        handleStateUpdate(
                          setBrandSettings,
                          "storeReplyToEmail",
                          e.target.value,
                        )
                      }
                    />
                  </s-grid>
                </CustomSection>
              </CustomGridSection>

              <s-stack paddingInline="large-100">
                <s-divider />
              </s-stack>

              <CustomGridSection
                heading="Store logo"
                description="Upload your logo and control how it appears in emails."
              >
                <CustomSection>
                  <s-grid gap="small">
                    <s-drop-zone
                      label="Recommended 240*80px. Maximum file size: 2MB (500KB recommended)."
                      accessibilityLabel="Upload image of type jpg, png, or gif"
                      accept=".jpg,.png,.gif"
                      onChange={(e) => console.log(e)}
                      onDropRejected="console.log('onDropRejected', event.currentTarget?.value)"
                    ></s-drop-zone>
                    <CustomSection>
                      <s-select
                        defaultValue={brandSettings.storeLogoPosition}
                        onChange={(e) =>
                          handleStateUpdate(
                            setBrandSettings,
                            "storeLogoPosition",
                            e.target.value,
                          )
                        }
                      >
                        <s-option value="LEFT">Left</s-option>
                        <s-option value="CENTER">Center</s-option>
                        <s-option value="RIGHT">Right</s-option>
                      </s-select>
                    </CustomSection>
                  </s-grid>
                </CustomSection>
              </CustomGridSection>

              <s-stack paddingInline="large-100">
                <s-divider />
              </s-stack>

              <CustomGridSection heading="Email styling">
                <s-grid gap="small">
                  <CustomSection
                    padding="small base"
                    background="#F0F0F0"
                    boxShadow="none"
                    border="none"
                  >
                    <s-grid gridTemplateColumns="auto 1fr" gap="small">
                      <s-icon type="alert-circle" />
                      <s-stack>
                        <s-stack direction="inline">
                          These style apply to all customer emails including
                          review requests, confirmations, and reply
                          notification. &nbsp;
                        </s-stack>
                      </s-stack>
                    </s-grid>
                  </CustomSection>

                  <s-grid gridTemplateColumns="1fr 1fr" gap="small">
                    {brandingColorSettings.map((picker) => {
                      return (
                        <ColorPicker
                          defaultColor={brandSettings[picker.key]}
                          onChange={(value) => {
                            handleStateUpdate(
                              setBrandSettings,
                              picker?.key,
                              value,
                            );
                          }}
                          data={{
                            key: picker?.key,
                            label: picker?.label,
                          }}
                        />
                      );
                    })}
                  </s-grid>
                </s-grid>
              </CustomGridSection>

              <s-stack paddingInline="large-100">
                <s-divider />
              </s-stack>

              <CustomGridSection heading="Email footer">
                <s-grid gap="small">
                  <CustomSection>
                    <s-grid gap="small">
                      <s-text-field
                        label="Footer text"
                        defaultValue={brandSettings.emailFooterText}
                        onInput={(e) =>
                          handleStateUpdate(
                            setBrandSettings,
                            "emailFooterText",
                            e.target.value,
                          )
                        }
                      />

                      <s-text-field
                        label="Footer link text"
                        defaultValue={brandSettings.emailFooterLinkText}
                        onInput={(e) =>
                          handleStateUpdate(
                            setBrandSettings,
                            "emailFooterLinkText",
                            e.target.value,
                          )
                        }
                      />
                    </s-grid>
                  </CustomSection>
                  <s-switch
                    label='Show "Powered by Qorix" badge'
                    details="Display Qorix branding in the email footer."
                    defaultChecked={brandSettings.isShowFooterBadge}
                    onInput={(e) =>
                      handleStateUpdate(
                        setBrandSettings,
                        "isShowFooterBadge",
                        e.target.checked,
                      )
                    }
                  />
                </s-grid>
              </CustomGridSection>
            </CustomSection>
          </CustomSection>

          <CustomSection background="#ffffff">
            <CustomSection background="#fff">
              <BrandingEmailPreview />
            </CustomSection>
          </CustomSection>
        </s-grid>
      </s-query-container>
    </>
  );
}
