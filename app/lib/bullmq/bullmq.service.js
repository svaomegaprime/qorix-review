import { sendEmail } from "../../utils/sendEmail";

async function scheduleEmailSend(emailData) {
  await sendEmail(emailData);
  console.log("email sent successfully");
  return;
}
async function reminderEmailSend(emailData) {
  await sendEmail(emailData);

  console.log("email sent successfully");
  return;
}

const bullmqService = {
  scheduleEmailSend,
  reminderEmailSend,
};

export default bullmqService;
