import CustomSection from "../../../../components/essentials/CustomSection";
import CustomGridSection from "../../../../components/essentials/CustomGridSection";
import checkPricingPlan from "../../../../utils/checkPricingPlan";
export default function SmtpSetup({ emailSettings, onChange, planState }) {
  const handleInputChange = (field) => (e) => {
    onChange(field, e.target.value);
  };

  const handleNumberChange = (field) => (e) => {
    const nextValue = e.target.value;
    onChange(field, nextValue === "" ? null : Number(nextValue));
  };

  const isSenderEmailRequired = Boolean(
    String(emailSettings?.smtpUser || "").trim(),
  );
  const isSenderEmailEmpty = !String(
    emailSettings?.smtpSenderEmail || "",
  ).trim();
  const senderEmailError =
    isSenderEmailRequired && isSenderEmailEmpty
      ? "Sender email is required"
      : undefined;

  return (
    <>
      <CustomSection padding="0">
        <CustomGridSection
          heading="SMTP configuration"
          description="Set the mailbox credentials Easy will use to send emails."
        >
          <CustomSection>
            <s-grid gap="small">
              <s-heading>SMTP User</s-heading>
              <s-text-field
                disabled={!checkPricingPlan(planState?.activePlan, "pro-plan")}
                value={emailSettings.smtpUser}
                onInput={handleInputChange("smtpUser")}
                placeholder="example@gmail.com"
              />

              <s-divider />
              <s-heading>Sender Email</s-heading>
              <s-text-field
                disabled={!checkPricingPlan(planState?.activePlan, "pro-plan")}
                value={emailSettings.smtpSenderEmail}
                onInput={handleInputChange("smtpSenderEmail")}
                placeholder="example@gmail.com"
                required={isSenderEmailRequired}
                error={senderEmailError}
              />

              <s-divider />
              <s-heading>SMTP Password</s-heading>
              <s-password-field
                disabled={!checkPricingPlan(planState?.activePlan, "pro-plan")}
                value={emailSettings.smtpPassword}
                onInput={handleInputChange("smtpPassword")}
                placeholder="$dsf>{?:@#4"
              />
              <s-divider />
              <s-heading>SMTP Port</s-heading>
              <s-number-field
                disabled={!checkPricingPlan(planState?.activePlan, "pro-plan")}
                value={emailSettings.smtpPort ?? ""}
                onInput={handleNumberChange("smtpPort")}
                placeholder={465}
              />
              <s-divider />
              <s-heading>SMTP Host</s-heading>
              <s-text-field
                disabled={!checkPricingPlan(planState?.activePlan, "pro-plan")}
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
