import { useEffect, useState } from "react";
import CustomGridSection from "../../../components/essentials/CustomGridSection";
import CustomSection from "../../../components/essentials/CustomSection";
import Text from "../../../components/essentials/elements/Text";
import { DEFAULT_BRANDING } from "../data/defaultData";
import { handleStateUpdate } from "../utils/client/utils.client";
import ColorPicker from "../../../routes/app.widgets/components/elements/ColorPicker";
import BrandingEmailPreview from "../components/essentials/BrandingEmailPreview";
import { useRouteLoaderData } from "react-router";

import { useFetcher, useLoaderData } from "react-router";
import { authenticate } from "../../../shopify.server";
import prisma from "../../../db.server";

import { getStoreData } from "../../../utils/getStoreData";

export async function loader({ request }) {
  try {
    const { admin, session } = await authenticate.admin(request);
    const { id } = await getStoreData(admin);

    const storeSettings = await prisma.storeSettings.findFirst({
      where: {
        storeId: id,
      },
      include: {
        brandingSettings: true,
      },
    });
    console.log(storeSettings);

    return { storeSettings };
  } catch (error) {
    console.log(error);

    return null;
  }
}

export async function action({ request }) {
  try {
    const { admin, session } = await authenticate.admin(request);

    const contentType = request.headers.get("content-type");
    if (contentType && contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("logoFile");

      if (!file || !(file instanceof File)) {
        return Response.json(
          { ok: false, error: "No file uploaded or invalid file format" },
          { status: 400 },
        );
      }

      // 2MB server-side limit check
      if (file.size > 2 * 1024 * 1024) {
        return Response.json(
          { ok: false, error: "File size exceeds the 2MB maximum limit" },
          { status: 400 },
        );
      }

      const uploadResult = await uploadFile(file);
      return Response.json({
        ok: true,
        message: "Logo uploaded successfully",
        url: uploadResult.url,
      });
    }

    const data = await request.json();
    // const { id } = await getStoreData(admin);

    const brandingSettingsData = await prisma.brandingSettings.update({
      where: {
        id: data.id,
      },
      data,
    });

    console.log(
      "[store settings]: requestSchedulingData data",
      brandingSettingsData,
    );

    // console.log("[store settings:]requestScheduling", res);

    return {
      ok: true,
      message: "upserted BrandingSettingsData",
    };
  } catch (error) {
    console.log(error);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export default function Branding() {
  const data = useRouteLoaderData("routes/app.settings");
  const { storeSettings } = useLoaderData();
  const fetcher = useFetcher();

  const [brandSettings, setBrandSettings] = useState(
    storeSettings.brandingSettings ?? DEFAULT_BRANDING,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleLogoUpload = async (e) => {
    let files = null;
    if (e.target?.files && e.target.files.length > 0) {
      files = e.target.files;
    } else if (e.detail?.files && e.detail.files.length > 0) {
      files = e.detail.files;
    } else if (e.target?.value) {
      files = e.target.value;
    } else if (e.detail?.value) {
      files = e.detail.value;
    }

    if (!files) {
      console.log("No files detected in upload event:", e);
      return;
    }

    const fileList =
      files instanceof FileList || Array.isArray(files) ? files : [files];
    const file = fileList[0];

    if (!file || !(file instanceof File)) {
      console.log("Invalid file object in upload event:", file);
      return;
    }

    // Check size limit: 2MB (2 * 1024 * 1024 bytes)
    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setUploadError("Image size must not exceed 2MB.");
      if (typeof shopify !== "undefined" && shopify.toast) {
        shopify.toast.show("Image size must not exceed 2MB.", {
          isError: true,
        });
      }
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("logoFile", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.ok) {
        handleStateUpdate(setBrandSettings, "storeLogo", result.data[0].url);

        shopify.toast.show("Logo uploaded successfully");
      } else {
        const errorMsg =
          result.error || result.message || "Failed to upload logo.";
        setUploadError(errorMsg);

        shopify.toast.show(errorMsg, { isError: true });
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setUploadError("An error occurred during upload.");

      shopify.toast.show("An error occurred during upload.", {
        isError: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

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

  useEffect(() => {
    const hasChanged =
      JSON.stringify(brandSettings) !==
      JSON.stringify(storeSettings?.brandingSettings);

    if (hasChanged) {
      shopify.saveBar.show("leave-confirm-save-bar");
    } else {
      shopify.saveBar.hide("leave-confirm-save-bar");
    }
  }, [brandSettings]);

  console.log("DEFAULT_REQUEST_SCHEDULING:", brandSettings);

  function handleSave() {
    fetcher.submit(brandSettings, {
      method: "POST",
      encType: "application/json",
    });
  }

 
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      shopify.saveBar.hide("leave-confirm-save-bar");
    }
  }, [fetcher.state, fetcher.data]);
  const [formResetKey, setFormResetKey] = useState(0);

  function handleDiscard() {
    setBrandSettings(storeSettings.brandingSettings ?? DEFAULT_BRANDING);
    setFormResetKey((pre) => pre + 1);
    shopify.saveBar.hide("leave-confirm-save-bar");
  }
  return (
    <>
      <pre>{JSON.stringify(brandSettings, null, 2)}</pre>

      <ui-save-bar id="leave-confirm-save-bar">
        <button onClick={handleSave} variant="primary" id="save-button">
          Save
        </button>
        <button onClick={handleDiscard} id="discard-button">
          Discard
        </button>
      </ui-save-bar>
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
          key={formResetKey}
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
                      onChange={handleLogoUpload}
                      onDropRejected="console.log('onDropRejected', event.currentTarget?.value)"
                    ></s-drop-zone>
                    {isUploading && (
                      <div
                        style={{
                          paddingBlock: "8px",
                          fontSize: "14px",
                          color: "#666",
                        }}
                      >
                        Uploading logo...
                      </div>
                    )}
                    {uploadError && (
                      <div
                        style={{
                          paddingBlock: "8px",
                          color: "#d32f2f",
                          fontSize: "14px",
                        }}
                      >
                        {uploadError}
                      </div>
                    )}
                    {brandSettings.storeLogo && !isUploading && (
                      <s-grid
                        gridTemplateColumns="auto 1fr"
                        gap="small"
                        alignItems="center"
                        style={{ marginBlock: "10px" }}
                      >
                        <div
                          style={{
                            border: "1px dashed #ccc",
                            padding: "6px",
                            borderRadius: "6px",
                            background: "#fcfcfc",
                          }}
                        >
                          <img
                            src={brandSettings.storeLogo}
                            alt="Store Logo Preview"
                            style={{
                              maxHeight: "60px",
                              maxWidth: "180px",
                              objectFit: "contain",
                              display: "block",
                            }}
                          />
                        </div>
                        <s-button
                          variant="secondary"
                          onClick={() =>
                            handleStateUpdate(setBrandSettings, "storeLogo", "")
                          }
                        >
                          Remove logo
                        </s-button>
                      </s-grid>
                    )}
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
                        <s-option value="start">Left</s-option>
                        <s-option value="center">Center</s-option>
                        <s-option value="end">Right</s-option>
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
              <BrandingEmailPreview
                brandSettings={brandSettings}
                outgoingRequestEmail={data.outgoingRequestEmail}
                postRequestEmail={data.postRequestEmail}
                smtpSetup={data.smtpSetup}
              />
            </CustomSection>
          </CustomSection>
        </s-grid>
      </s-query-container>
    </>
  );
}
