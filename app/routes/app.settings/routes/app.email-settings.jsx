import Text from "../../../components/essentials/elements/Text";
import CustomSection from "../../../components/essentials/CustomSection";
import TabButton from "../../../components/essentials/TabButton";
import { useEffect, useState } from "react";
import SmtpSetup from "../components/essentials/SmtpSetup";
import RequestEmail from "../components/essentials/RequestEmail";
import PostReviewEmail from "../components/essentials/PostReviewEmail";
import ArrowUpRight from "../../../assets/icon/ArrowUpRight";
import {
  DEFAULT_OUTGOING_REQUEST_EMAIL,
  DEFAULT_POST_REQUEST_EMAIL,
  DEFAULT_SMTP_SETUP,
} from "../data/defaultData";
import { useFetcher, useLoaderData, useNavigate } from "react-router";
import { authenticate } from "../../../shopify.server";
import prisma from "../../../db.server";
import { adminErrorResponse } from "../../../utils/adminError.server";
import { useAdminFetcherToast } from "../../../utils/useAdminFetcherToast";
import SaveBar from "../../../components/essentials/SaveBar";
import { useSaveBarForm } from "../../../hooks/useSaveBarForm.js";
import { requireAdminContext } from "../../../services/adminContext.server.js";

const EMAIL_SETTINGS_DEFAULTS = {
  ...DEFAULT_SMTP_SETUP,
  ...DEFAULT_OUTGOING_REQUEST_EMAIL,
  ...DEFAULT_POST_REQUEST_EMAIL,
};

function normalizeEmailSettings(emailSettings = {}, storeSettingsId) {
  const normalizedFields = Object.fromEntries(
    Object.entries(EMAIL_SETTINGS_DEFAULTS).map(([key, defaultValue]) => [
      key,
      emailSettings?.[key] ?? defaultValue,
    ]),
  );

  return {
    ...emailSettings,
    ...normalizedFields,
    storeSettingsId: emailSettings?.storeSettingsId ?? storeSettingsId,
  };
}

export async function loader({ request }) {
  try {
    const { storeId: id } = await requireAdminContext(request);

    const storeSettings = await prisma.storeSettings.findFirst({
      where: {
        storeId: id,
      },
      include: {
        emailSettings: true,
      },
    });

    return { storeSettings };
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function action({ request }) {
  try {
    await authenticate.admin(request);

    const data = await request.json();
    const emailSettingsData = Object.fromEntries(
      Object.entries(data).filter(
        ([key]) => !["id", "createdAt", "updatedAt"].includes(key),
      ),
    );

    if (!emailSettingsData.storeSettingsId) {
      throw new Error("storeSettingsId is required to save email settings");
    }

    const savedEmailSettings = await prisma.emailSettings.upsert({
      where: {
        storeSettingsId: emailSettingsData.storeSettingsId,
      },
      create: emailSettingsData,
      update: emailSettingsData,
    });

    console.log("[store settings]: savedEmailSettings", savedEmailSettings);

    return {
      ok: true,
      message: "Email settings saved successfully",
      emailSettings: savedEmailSettings,
    };
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export default function EmailSettings() {
  const fetcher = useFetcher();
  useAdminFetcherToast(fetcher);
  const { storeSettings } = useLoaderData();
  const navigate = useNavigate();

  const initialEmailSettings = normalizeEmailSettings(
    storeSettings?.emailSettings,
    storeSettings?.id,
  );
  const [emailActiveSettings, setEmailActiveSettings] = useState({
    requestEmail: false,
    postReviewEmail: false,
    SMTPSetup: true,
  });
  const [emailSettings, setEmailSettings] = useState(initialEmailSettings);

  useEffect(() => {
    const nextEmailSettings = normalizeEmailSettings(
      storeSettings?.emailSettings,
      storeSettings?.id,
    );

    setEmailSettings(nextEmailSettings);
  }, [storeSettings?.emailSettings, storeSettings?.id]);

  function handleEmailSettingsChange(field, value) {
    setEmailSettings((previousSettings) => ({
      ...previousSettings,
      [field]: value,
    }));
  }

  const { handleSave, handleDiscard } = useSaveBarForm({
    value: emailSettings,
    initialValue: initialEmailSettings,
    fetcher,
    onSave: (value) =>
      fetcher.submit(value, { method: "POST", encType: "application/json" }),
    onDiscard: setEmailSettings,
    getSavedValue: (data, submittedValue) =>
      data.emailSettings
        ? normalizeEmailSettings(data.emailSettings, storeSettings?.id)
        : submittedValue,
    onSaved: setEmailSettings,
  });

  return (
    <>
      <SaveBar
        onSave={handleSave}
        onDiscard={handleDiscard}
        saving={fetcher.state !== "idle"}
      />

      <s-stack
        paddingBlockEnd="base"
        direction="inline"
        alignItems="center"
        justifyContent="space-between"
      >
        <s-box>
          <Text>Email settings</Text>
          <s-text>Manage what customers see in every email from Qorix</s-text>
        </s-box>
        <s-stack direction="inline" gap="base">
          <s-button
            href="/app/settings/branding"
            icon="business-entity"
            inline="fill"
            variant="secondary"
          >
            Preview email
          </s-button>
            <s-button  variant="secondary" onClick={() => window.open("http://qorix-review-docs.nextvence.com/pages/settings/email-settings", "_blank")}>
          Need Help ?
        </s-button>
        </s-stack>
      </s-stack>
      <s-section>
        <s-stack gap="base" direction="inline" paddingBlockEnd="large">
          <TabButton
            onClick={() =>
              setEmailActiveSettings({
                requestEmail: false,
                postReviewEmail: false,
                SMTPSetup: true,
              })
            }
            isActive={emailActiveSettings.SMTPSetup}
          >
            SMTP Setup
          </TabButton>
          <TabButton
            isActive={emailActiveSettings.requestEmail}
            onClick={() =>
              setEmailActiveSettings({
                requestEmail: true,
                postReviewEmail: false,
                SMTPSetup: false,
              })
            }
          >
            Outgoing request emails
          </TabButton>

          <TabButton
            onClick={() =>
              setEmailActiveSettings({
                requestEmail: false,
                postReviewEmail: true,
                SMTPSetup: false,
              })
            }
            isActive={emailActiveSettings.postReviewEmail}
          >
            Post-review emails
          </TabButton>
        </s-stack>

        <CustomSection
          padding="small base"
          background="#F7F7F7"
          boxShadow="none"
          border="none"
        >
          <s-grid gridTemplateColumns="auto 1fr" gap="small">
            <s-icon type="alert-circle" />
            <s-stack>
              <s-heading>
                Purpose: Emails sent from you to customers asking them to leave
                a review.
              </s-heading>
              <s-stack direction="inline">
                Triggered automatically after order delivery based on the timing
                set in &nbsp;
                <Text
                  as="span"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/app/settings");
                  }}
                  style={{
                    cursor: "pointer",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                  }}
                  color="#108848"
                >
                  Request scheduling. <ArrowUpRight />
                </Text>
              </s-stack>
              
            </s-stack>
          </s-grid>
        </CustomSection>
<br></br>
        <s-banner heading="SMTP not configured" tone="warning" >
 If SMTP is not configured, Qorix Review will use its default SMTP service to send emails to customers. You can add your email under Admin Notifications to receive a copy (CC) of each email sent.
  <s-button
    slot="secondary-actions"
    variant="secondary"
    href="/app/settings/admin-notification"
  >
  Go to Admin Notifications
  </s-button>

    <s-button   slot="secondary-actions"
    variant="secondary" onClick={() => window.open("http://qorix-review-docs.nextvence.com/pages/settings/gmail-smtp-setup", "_blank")}>
          SMTP Setup Guide
      </s-button>

</s-banner>

        <s-box paddingBlockStart="large"></s-box>
        {emailActiveSettings.requestEmail && (
          <RequestEmail
            emailSettings={emailSettings}
            onChange={handleEmailSettingsChange}
          />
        )}
        {emailActiveSettings.postReviewEmail && (
          <PostReviewEmail
            emailSettings={emailSettings}
            onChange={handleEmailSettingsChange}
          />
        )}
        {emailActiveSettings.SMTPSetup && (
          <SmtpSetup
            emailSettings={emailSettings}
            onChange={handleEmailSettingsChange}
          />
        )}
      </s-section>
    </>
  );
}
