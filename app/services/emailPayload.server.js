import { formatEmailBody } from "../utils/formatEmailBody.js";
import { getRelativeTime } from "../utils/getRelativeTime.js";

/** @param {Record<string, any> | null | undefined} emailSettings */
export function buildSmtpConfig(emailSettings) {
  return {
    smtpHost: emailSettings?.smtpHost,
    smtpPort: emailSettings?.smtpPort,
    smtpUser: emailSettings?.smtpUser,
    smtpPassword: emailSettings?.smtpPassword,
  };
}

/** @param {Record<string, any> | null | undefined} brandingSettings */
export function buildBrandingTemplateData(brandingSettings) {
  return {
    storeTagline: brandingSettings?.storeTagline,
    storeName: brandingSettings?.storeDisplayName,
    storeFooterText: brandingSettings?.emailFooterText ?? "",
    storeFooterLinkText: brandingSettings?.emailFooterLinkText ?? "",
    isShowFooterBadge: brandingSettings?.isShowFooterBadge,
    storeLogo: brandingSettings?.storeLogo,
    storeLogoPosition: brandingSettings?.storeLogoPosition,
    emailPrimaryButtonColor: brandingSettings?.emailPrimaryButtonColor,
    emailButtonTextColor: brandingSettings?.emailButtonTextColor,
    emailBackgroundColor: brandingSettings?.emailBackgroundColor,
    emailHeadingColor: brandingSettings?.emailHeadingColor,
    emailBodyTextColor: brandingSettings?.emailBodyTextColor,
    emailAccentBorderColor: brandingSettings?.emailAccentBorderColor,
  };
}

/**
 * @param {Record<string, any>} formattedOrder
 * @param {Record<string, any>} storeSettings
 */
function buildOrderEmailBase(formattedOrder, storeSettings) {
  const emailSettings = storeSettings?.emailSettings;
  const brandingSettings = storeSettings?.brandingSettings;

  return {
    to: formattedOrder.email,
    from: emailSettings?.smtpUser,
    replyTo: brandingSettings?.storeReplyToEmail,
    smtpConfig: buildSmtpConfig(emailSettings),
    templateData: {
      ...buildBrandingTemplateData(brandingSettings),
      name: formattedOrder?.fullName,
      timeAgo: formattedOrder?.timeAgo,
      products: formattedOrder?.products ?? [],
    },
  };
}

/**
 * @param {Record<string, any>} formattedOrder
 * @param {Record<string, any>} storeSettings
 * @param {{ firstName?: string }} [options]
 */
export function buildRequestEmailData(
  formattedOrder,
  storeSettings,
  options = {},
) {
  const base = buildOrderEmailBase(formattedOrder, storeSettings);
  const emailSettings = storeSettings?.emailSettings;
  const brandingSettings = storeSettings?.brandingSettings;

  return {
    ...base,
    templateName: "RequestsEmail",
    subject: emailSettings?.requestEmailSubjectLine,
    templateData: {
      ...base.templateData,
      requestEmailBody: formatEmailBody(
        emailSettings?.requestEmailBody,
        options.firstName ?? formattedOrder?.fullName,
        brandingSettings?.storeDisplayName,
        formattedOrder?.products?.[0]?.title,
      ),
      requestEmailButton: emailSettings?.requestEmailButton,
    },
  };
}

/**
 * @param {Record<string, any>} formattedOrder
 * @param {Record<string, any>} storeSettings
 * @param {{ firstName?: string }} [options]
 */
export function buildReminderEmailData(
  formattedOrder,
  storeSettings,
  options = {},
) {
  const base = buildOrderEmailBase(formattedOrder, storeSettings);
  const emailSettings = storeSettings?.emailSettings;
  const brandingSettings = storeSettings?.brandingSettings;

  return {
    ...base,
    templateName: "ReminderEmail",
    subject: emailSettings?.reminderSubjectLine,
    templateData: {
      ...base.templateData,
      reminderEmailBody: formatEmailBody(
        emailSettings?.reminderEmailBody,
        options.firstName ?? formattedOrder?.fullName,
        brandingSettings?.storeDisplayName,
        formattedOrder?.products?.[0]?.title,
      ),
      reminderEmailButton: emailSettings?.reminderEmailButton,
      storeFooterTextLink: brandingSettings.externalSettings?.externalSettings,
    },
  };
}

/**
 * @param {{ review: Record<string, any>, storeSettings: Record<string, any>, storeData: Record<string, any>, buttonUrl?: string }} input
 */
export function buildReplyEmailData({
  review,
  storeSettings,
  storeData,
  buttonUrl = "#",
}) {
  const emailSettings = storeSettings?.emailSettings;
  const brandingSettings = storeSettings?.brandingSettings;
  const productTitle = review.productTitle ?? "";
  const storeName = brandingSettings?.storeDisplayName ?? storeData?.name ?? "";

  return {
    to: review.reviewerEmail,
    from: emailSettings?.smtpUser,
    replyTo: brandingSettings?.storeReplyToEmail,
    templateName: "ReplyEmail",
    subject: emailSettings?.replyEmailSubjectLine,
    smtpConfig: buildSmtpConfig(emailSettings),
    templateData: {
      ...buildBrandingTemplateData(brandingSettings),
      name: review.reviewerName,
      timeAgo: getRelativeTime(review.createdAt),
      products: productTitle ? [{ title: productTitle }] : [],
      storeName,
      buttonUrl,
      replyEmailBody: formatEmailBody(
        emailSettings?.replyEmailBody,
        review.reviewerName,
        storeName,
        productTitle,
      ),
      replyEmailButton: emailSettings?.replyEmailButton,
      review: review.body,
      rating: review.rating,
      reply: review.reply?.body,
      replyFrom: storeName,
    },
  };
}
