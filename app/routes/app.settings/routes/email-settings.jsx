import Text from "../../../components/essentials/elements/Text";
import CustomSection from "../../../components/essentials/CustomSection";
import CustomGridSection from "../../../components/essentials/CustomGridSection";
import TabButton from "../../../components/essentials/TabButton";
import { useState } from "react";
import RequestEmail from "../components/essentials/RequestEmail";
import PostReviewEmail from "../components/essentials/PostReviewEmail";

export default function EmailSettings() {
  const [emailActiveSettings, setEmailActiveSettings] = useState({
    requestEmail: true,
    postReviewEmail: false,
  });

  return (
    <>
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
        <s-stack gap="base" direction="inline" paddingBlockEnd="large-400">
          <TabButton
            isActive={emailActiveSettings.requestEmail}
            onClick={() =>
              setEmailActiveSettings({
                requestEmail: true,
                postReviewEmail: false,
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
              })
            }
            isActive={emailActiveSettings.postReviewEmail}
          >
            Post-review emails
          </TabButton>
        </s-stack>
        {emailActiveSettings.requestEmail && <RequestEmail />}
        {emailActiveSettings.postReviewEmail && <PostReviewEmail />}
      </s-section>
    </>
  );
}
