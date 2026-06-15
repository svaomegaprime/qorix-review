import CustomSection from "../../../../components/essentials/CustomSection";
import CustomGridSection from "../../../../components/essentials/CustomGridSection";
import { useState } from "react";
import { DEFAULT_SMTP_SETUP } from "../../data/defaultData";
import { handleStateUpdate } from "../../utils/client/utils.client";

export default function SmtpSetup({ smtpSetup, setSmtpSetup }) {
  return (
    <>
      <CustomSection padding="0">
        <CustomGridSection
          heading="Request email content"
          description="Customize what customers see in their review request."
        >
          <CustomSection>
            <s-grid gap="small">
              <s-heading>SMTP User</s-heading>
              <s-text-field
                onInput={(e) =>
                  handleStateUpdate(setSmtpSetup, "smtpUser", e.target.value)
                }
                placeholder="example@gmail.com"
              />
              <s-divider />
              <s-heading>SMTP Password</s-heading>
              <s-password-field
                onInput={(e) =>
                  handleStateUpdate(
                    setSmtpSetup,
                    "smtpPassword",
                    e.target.value,
                  )
                }
                placeholder="$dsf>{?:@#4"
              />
              <s-divider />
              <s-heading>SMTP Port</s-heading>
              <s-number-field
                onInput={(e) =>
                  handleStateUpdate(
                    setSmtpSetup,
                    "smtpPort",
                    Number(e.target.value),
                  )
                }
                placeholder={465}
              />
              <s-divider />
              <s-heading>SMTP Host</s-heading>
              <s-text-field
                onInput={(e) =>
                  handleStateUpdate(setSmtpSetup, "smtpHost", e.target.value)
                }
                placeholder="smtp.gmail.com"
              />
            </s-grid>
          </CustomSection>
        </CustomGridSection>
      </CustomSection>
    </>
  );
}
