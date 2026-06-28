import Text from "../../../components/essentials/elements/Text";
import CustomSection from "../../../components/essentials/CustomSection";
import CustomGridSection from "../../../components/essentials/CustomGridSection";
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

export async function loader({ request }) {
  try {
    const { admin, session } = await authenticate.admin(request);
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
    const { admin, session } = await authenticate.admin(request);

    const data = await request.json();
    // const { id } = await getStoreData(admin);

    const emailSettingsData = await prisma.emailSettings.update({
      where: {
        id: data.id,
      },
      data,
    });

    console.log(
      "[store settings]: emailSettingsData",
      emailSettingsData,
    );

    // console.log("[store settings:]requestScheduling", res);

    return {
      ok: true,
      message: "upserted EmailSettingsData",
    };
  } catch (error) {
    console.log(error);
  }
}

export default function EmailSettings() {
  const fetcher = useFetcher();
  const { storeSettings } = useLoaderData();
  const initialEmailSettings = storeSettings?.emailSettings ?? {
    ...DEFAULT_SMTP_SETUP,
    ...DEFAULT_OUTGOING_REQUEST_EMAIL,
    ...DEFAULT_POST_REQUEST_EMAIL,
  };
  const [emailActiveSettings, setEmailActiveSettings] = useState({
    requestEmail: false,
    postReviewEmail: false,
    SMTPSetup: true,
  });

  const [emailSettings, setEmailSettings] = useState(initialEmailSettings);
  const [formResetKey, setFormResetKey] = useState(0);

  useEffect(() => {
    const hasChanged =
      JSON.stringify(emailSettings) !== JSON.stringify(initialEmailSettings);

    if (hasChanged) {
      shopify.saveBar.show("leave-confirm-save-bar");
    } else {
      shopify.saveBar.hide("leave-confirm-save-bar");
    }
  }, [emailSettings]);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      console.log("Response:", fetcher.data);

      // Save successful
      shopify.saveBar.hide("leave-confirm-save-bar");
    }
  }, [fetcher.state, fetcher.data]);

  function handleSave() {
    fetcher.submit(emailSettings, {
      method: "POST",
      encType: "application/json",
    });
  }

  console.log("loading:", fetcher.state);
  function handleDiscard() {
    setEmailSettings({ ...initialEmailSettings });
    setFormResetKey((pre) => pre + 1);
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
            key={`request-${formResetKey}`}
            outgoingRequestEmail={emailSettings}
            setOutgoingRequestEmail={setEmailSettings}
          />
        )}
        {emailActiveSettings.postReviewEmail && (
          <PostReviewEmail
            key={`post-${formResetKey}`}
            postReviewEmail={emailSettings}
            setPostReviewEmail={setEmailSettings}
          />
        )}
        {emailActiveSettings.SMTPSetup && (
          <SmtpSetup
            key={`smtp-${formResetKey}`}
            smtpSetup={emailSettings}
            setSmtpSetup={setEmailSettings}
          />
        )}
      </s-section>
    </>
  );
}
