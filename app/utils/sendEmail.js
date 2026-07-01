/* eslint-disable @typescript-eslint/no-explicit-any */
import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";
const getSmtpConfig = (smtpConfig) => {
  const host = String(smtpConfig.smtpHost || "").trim();
  const port = Number(smtpConfig.smtpPort || 0);
  const user = String(smtpConfig.smtpUser || "").trim();
  const pass = String(smtpConfig.smtpPassword || "").trim();

  return {
    host,
    port,
    user,
    pass,
    secure: port === 465,
    isConfigured: Boolean(host && port && user && pass),
  };
};

let transporter = null;
const getTransporter = (smtpConfig) => {
  if (transporter) return transporter;

  const smtp = getSmtpConfig(smtpConfig);
  if (!smtp.isConfigured) return null;

  transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  return transporter;
};

export const sendEmail = async ({
  to,
  bcc,
  subject,
  templateName = "EmailTemplate",
  templateData = {},
  attachments,
  from,
  replyTo,
  smtpConfig
}) => {
  try {
    const activeTransporter = getTransporter(smtpConfig);
    if (!activeTransporter) {
      console.warn(
        "Email skipped: SMTP configuration missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.",
      );
      return { ok: false, skipped: true, reason: "smtp_not_configured" };
    }

    const rootDir = path.resolve(process.cwd());
    const templatePath = path.join(
      rootDir,
      "app",
      "utils",
      "template",
      `${templateName}.ejs`,
    );
    const html = await ejs.renderFile(templatePath, templateData);
    const resolvedFrom =
      from ||
      String(process.env.SMTP_FROM || "").trim() ||
      String(process.env.SMTP_USER || "").trim();
    const resolvedReplyTo = String(replyTo || "").trim() || undefined;

    const info = await activeTransporter.sendMail({
      from: resolvedFrom,
      replyTo: resolvedReplyTo,
      to,
      bcc,
      subject,
      html,
      headers: {
        "List-Unsubscribe": `<${templateData.buttonUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });

    console.log(info)
    return { ok: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email sending error:", error?.message || error);
    return { ok: false, error: error?.message || "unknown_error" };
  }
};
