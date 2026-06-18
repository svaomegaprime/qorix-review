import React, { useState } from "react";
import Text from "../../../../components/essentials/elements/Text";
// import TabButton from "app/components/essentials/TabButton";
import TabButton from "../../../../components/essentials/TabButton";
import EmailRequest from "../template/EmailRequest";
import EmailConfirmation from "../template/EmailConfirmation";
import EmailReply from "../template/EmailReply";
export default function BrandingEmailPreview({
  brandSettings,
  outgoingRequestEmail,
  postRequestEmail,
  smtpSetup,
}) {
  const [showEmailTemplate, setShowEmailTemplate] = useState({
    emailRequest: true,
    emailConfirmation: false,
    emailReply: false,
  });
  return (
    <>
      <s-box paddingBlockEnd="small">
        <s-stack
          paddingBlockEnd="base"
          direction="inline"
          alignItems="center"
          justifyContent="space-between"
        >
          <Text>Email settings</Text>
          <s-button icon="business-entity" inline="fill" variant="secondary">
            Refresh preview
          </s-button>
        </s-stack>
        <s-text>Manage what customers see in every email from Qorix</s-text>
      </s-box>
      <s-grid
        gridTemplateColumns="1fr 1fr 1fr"
        gap="base"
        paddingBlockEnd="base"
      >
        <TabButton
          isActive={showEmailTemplate.emailRequest}
          onClick={() =>
            setShowEmailTemplate({
              emailRequest: true,
              emailConfirmation: false,
              emailReply: false,
            })
          }
        >
          Request
        </TabButton>
        <TabButton
          isActive={showEmailTemplate.emailConfirmation}
          onClick={() =>
            setShowEmailTemplate({
              emailRequest: false,
              emailConfirmation: true,
              emailReply: false,
            })
          }
        >
          Confirmation
        </TabButton>
        <TabButton
          isActive={showEmailTemplate.emailReply}
          onClick={() =>
            setShowEmailTemplate({
              emailRequest: false,
              emailConfirmation: false,
              emailReply: true,
            })
          }
        >
          Reply
        </TabButton>
      </s-grid>

      {/* Start---- EmailRequest Preview */}
      {showEmailTemplate.emailRequest && (
        <EmailRequest
          outgoingRequestEmail={outgoingRequestEmail}
          brandSettings={brandSettings}
        />
      )}
      {/* End---- EmailRequest Preview */}
      {/* Start---- EmailConfirmation Preview */}
      {showEmailTemplate.emailConfirmation && (
        <EmailConfirmation
          postRequestEmail={postRequestEmail}
          brandSettings={brandSettings}
        />
      )}
      {/* End---- EmailConfirmation Preview */}
      {/* Start---- EmailReply Preview */}
      {showEmailTemplate.emailReply && <EmailReply />}
      {/* End---- EmailReply Preview */}
    </>
  );
}
