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
import { useFetcher, useLoaderData } from "react-router";
import { authenticate } from "../../../shopify.server";
import { getStoreData } from "../../../utils/getStoreData";
import prisma from "../../../db.server";

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
    const { admin } = await authenticate.admin(request);
    const { id } = await getStoreData(admin);

    const storeSettings = await prisma.storeSettings.findFirst({
      where: {
        storeId: id,
      },
      include: {
        emailSettings: true,
      },
    });
    console.log(storeSettings);

    return { storeSettings };
  } catch (error) {
    console.log(error);

    return {};
  }
}

export async function action({ request }) {
  try {
    await authenticate.admin(request);

    const data = await request.json();
    const { id, createdAt, updatedAt, ...emailSettingsData } = data;

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
      message: "upserted EmailSettingsData",
      emailSettings: savedEmailSettings,
    };
  } catch (error) {
    console.log(error);
  }
}

export default function EmailSettings() {
  const fetcher = useFetcher();
  const { storeSettings } = useLoaderData();
  
  const initialEmailSettings = normalizeEmailSettings(
    storeSettings?.emailSettings,
    storeSettings?.id,
  );
  const [emailActiveSettings, setEmailActiveSettings] = useState({
    requestEmail: false,
    postReviewEmail: false,
    SMTPSetup: true,
  });
  const [savedEmailSettings, setSavedEmailSettings] = useState(
    initialEmailSettings,
  );
  const [emailSettings, setEmailSettings] = useState(initialEmailSettings);

  useEffect(() => {
    const nextEmailSettings = normalizeEmailSettings(
      storeSettings?.emailSettings,
      storeSettings?.id,
    );

    setSavedEmailSettings(nextEmailSettings);
    setEmailSettings(nextEmailSettings);
  }, [storeSettings?.emailSettings, storeSettings?.id]);

  useEffect(() => {
    const hasChanged =
      JSON.stringify(emailSettings) !== JSON.stringify(savedEmailSettings);

    if (hasChanged) {
      shopify.saveBar.show("leave-confirm-save-bar");
    } else {
      shopify.saveBar.hide("leave-confirm-save-bar");
    }
  }, [emailSettings, savedEmailSettings]);

  useEffect(() => {
    if (
      fetcher.state === "idle" &&
      fetcher.data?.ok &&
      fetcher.data?.emailSettings
    ) {
      console.log("Response:", fetcher.data);
      const nextSavedEmailSettings = normalizeEmailSettings(
        fetcher.data.emailSettings,
        storeSettings?.id,
      );

      setSavedEmailSettings(nextSavedEmailSettings);
      setEmailSettings(nextSavedEmailSettings);
      shopify.saveBar.hide("leave-confirm-save-bar");
    }
  }, [fetcher.state, fetcher.data, storeSettings?.id]);

  function handleEmailSettingsChange(field, value) {
    setEmailSettings((previousSettings) => ({
      ...previousSettings,
      [field]: value,
    }));
  }

  function handleSave() {
    fetcher.submit(emailSettings, {
      method: "POST",
      encType: "application/json",
    });
  }

  console.log("loading:", fetcher.state);

  function handleDiscard() {
    setEmailSettings(savedEmailSettings);
    shopify.saveBar.hide("leave-confirm-save-bar");
  }

  return (
    <>
      <ui-save-bar id="leave-confirm-save-bar">
        <button onClick={handleSave} variant="primary" id="save-button">
          Save
        </button>
        <button onClick={handleDiscard} id="discard-button">
          Discard
        </button>
      </ui-save-bar>

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
        <s-button icon="business-entity" inline="fill" variant="secondary">
          Preview email
        </s-button>
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
                  as="a"
                  href="//"
                  style={{
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
