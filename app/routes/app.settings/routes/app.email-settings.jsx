import Text from "../../../components/essentials/elements/Text";
import CustomSection from "../../../components/essentials/CustomSection";
import CustomGridSection from "../../../components/essentials/CustomGridSection";
import TabButton from "../../../components/essentials/TabButton";
import { useState } from "react";
import SmtpSetup from "../components/essentials/SmtpSetup";
import RequestEmail from "../components/essentials/RequestEmail";
import PostReviewEmail from "../components/essentials/PostReviewEmail";
import ArrowUpRight from "../../../assets/icon/ArrowUpRight";
import {
  DEFAULT_OUTGOING_REQUEST_EMAIL,
  DEFAULT_POST_REQUEST_EMAIL,
  DEFAULT_SMTP_SETUP,
} from "../data/defaultData";

export default function EmailSettings() {
  const [emailActiveSettings, setEmailActiveSettings] = useState({
    requestEmail: false,
    postReviewEmail: false,
    SMTPSetup: true,
  });

  const [outgoingRequestEmail, setOutgoingRequestEmail] = useState(
    DEFAULT_OUTGOING_REQUEST_EMAIL,
  );
  const [postReviewEmail, setPostReviewEmail] = useState(
    DEFAULT_POST_REQUEST_EMAIL,
  );
  const [smtpSetup, setSmtpSetup] = useState(DEFAULT_SMTP_SETUP);

  return (
    <>
      <pre>{JSON.stringify(outgoingRequestEmail, null, 2)}</pre>
      <pre>{JSON.stringify(postReviewEmail, null, 2)}</pre>
      <pre>{JSON.stringify(smtpSetup, null, 2)}</pre>
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
            outgoingRequestEmail={outgoingRequestEmail}
            setOutgoingRequestEmail={setOutgoingRequestEmail}
          />
        )}
        {emailActiveSettings.postReviewEmail && (
          <PostReviewEmail
            postReviewEmail={postReviewEmail}
            setPostReviewEmail={setPostReviewEmail}
          />
        )}
        {emailActiveSettings.SMTPSetup && (
          <SmtpSetup smtpSetup={smtpSetup} setSmtpSetup={setSmtpSetup} />
        )}
      </s-section>
    </>
  );
}
