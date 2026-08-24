/* eslint-disable @typescript-eslint/no-explicit-any */
/* global process */
import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";
const getSmtpConfig = (smtpConfig) => {
  const host = String(smtpConfig.smtpHost || "").trim();
  const port = Number(smtpConfig.smtpPort || 0);
  const user = String(smtpConfig.smtpUser || "").trim();
  const pass =
    String(smtpConfig.smtpPassword || "").trim() == "password"
      ? process.env.RESEND_EMAIL_PASSWORD
      : String(smtpConfig.smtpPassword || "").trim();

  return {
    host,
    port,
    user,
    pass,
    secure: port == 465,
    isConfigured: Boolean(host && port && user && pass),
  };
};

const transporterCache = new Map();

const getTransportCacheKey = (smtp) =>
  [smtp.host, smtp.port, smtp.user, smtp.pass].join(":");

const getTransporter = (smtpConfig) => {
  const smtp = getSmtpConfig(smtpConfig);
  if (!smtp.isConfigured) return null;

  const cacheKey = getTransportCacheKey(smtp);
  if (transporterCache.has(cacheKey)) {
    return transporterCache.get(cacheKey);
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  transporterCache.set(cacheKey, transporter);

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
  smtpConfig,
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
      from || smtpConfig?.smtpSenderEmail || smtpConfig?.smtpUser || "";
    const resolvedReplyTo = String(replyTo || "").trim() || undefined;

    const info = await activeTransporter.sendMail({
      from: resolvedFrom,
      replyTo: resolvedReplyTo,
      to,
      bcc,
      subject,
      html,
      text: html.replace(/<[^>]*>?/gm, ""),
      // headers: {
      //   "List-Unsubscribe": `<${templateData.buttonUrl}>`,
      //   "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      // },
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });

    console.log(info);
    return { ok: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email sending error:", error?.message || error);
    return { ok: false, error: error?.message || "unknown_error" };
  }
};
