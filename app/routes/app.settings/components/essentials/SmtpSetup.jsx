import CustomSection from "../../../../components/essentials/CustomSection";
import CustomGridSection from "../../../../components/essentials/CustomGridSection";

export default function SmtpSetup({ emailSettings, onChange }) {
  const handleInputChange = (field) => (e) => {
    onChange(field, e.target.value);
  };

  const handleNumberChange = (field) => (e) => {
    const nextValue = e.target.value;
    onChange(field, nextValue === "" ? null : Number(nextValue));
  };

  return (
    <>
      <CustomSection padding="0">
        <CustomGridSection
          heading="SMTP configuration"
          description="Set the mailbox credentials Qorix will use to send emails."
        >
          <CustomSection>
            <s-grid gap="small">
              <s-heading>SMTP User</s-heading>
              <s-text-field
                value={emailSettings.smtpUser}
                onInput={handleInputChange("smtpUser")}
                placeholder="example@gmail.com"
              />
              <s-divider />
              <s-heading>SMTP Password</s-heading>
              <s-password-field
                value={emailSettings.smtpPassword}
                onInput={handleInputChange("smtpPassword")}
                placeholder="$dsf>{?:@#4"
              />
              <s-divider />
              <s-heading>SMTP Port</s-heading>
              <s-number-field
                value={emailSettings.smtpPort ?? ""}
                onInput={handleNumberChange("smtpPort")}
                placeholder={465}
              />
              <s-divider />
              <s-heading>SMTP Host</s-heading>
              <s-text-field
                value={emailSettings.smtpHost}
                onInput={handleInputChange("smtpHost")}
                placeholder="smtp.gmail.com"
              />
            </s-grid>
          </CustomSection>
        </CustomGridSection>
      </CustomSection>
    </>
  );
}
