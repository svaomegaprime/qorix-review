export const DEFAULT_REQUEST_SCHEDULING = {
  isAutomaticRequest: true,
  sendRequestAfterDelivery: 5,
  isReminderRequest: true,
  reminderRequestDelay: 5,
  isSkipRefundedOrder: true,
  isSkipCancelledOrder: true,
  minimumOrderValue: 0,
};

export const DEFAULT_OUTGOING_REQUEST_EMAIL = {
  requestEmailSubjectLine: "How did we do? Share your thoughts ⭐",
  requestEmailBody:
    "Hi {{first_name}}, thank you for your recent order! We'd love to hear what you think. It only takes 30 seconds.",
  requestEmailButton: "Leave a review →",

  reminderSubjectLine: "Still time to share your thoughts ✍️",
  reminderEmailBody:
    "Hi {{first_name}}, we noticed you haven't had a chance to leave a review yet. We'd really appreciate your feedback!",
  reminderEmailButton: "Write my review →",

  replyEmailSubjectLine: "We've replied to your review 💬",
  replyEmailBody:
    "Hi {{first_name}}, thank you for your review. We've posted a reply and would love for you to take a look.",
  replyEmailButton: "View reply →",
};

export const DEFAULT_POST_REQUEST_EMAIL = {
  isConfirmationReviewEmail: true,
  confirmationEmailSubject: "Thanks for your review! 🙏",
  confirmationEmailBody:
    "Hi {{first_name}}, your review has been received. We really appreciate you taking the time!",

  isReplyReviewEmail: false,
  replyReviewEmailSubject: "The store replied to your review 💬",
};

export const DEFAULT_PUBLISHING_MODERATION = {
  autoPublishRules: "AUTO_PUBLISH", // VERIFIED_ONLY // MANUAL_PUBLISH
  isLowRatingHold: true,
  isProfanityFilter: true,
  isPersonalInfoFilter: true,
  isSpamFilter: true,
};

export const DEFAULT_WIDGET = {
  defaultStarColor: "#F59E0B",
  defaultFontSize: "14px",
  defaultBorderRadius: "8px",
  isShowVerifiedBadge: true,
  isShowReviewerName: true,
  isShowReviewerDate: true,

  reviewsPerPage: 10,
  reviewSortOrder: "RECENT", //RATED// HELPFUL
  minimumStarRatingToDisplay: "ALL_RATINGS", // 3_STAR // 5_STAR
  isShowMediaFirst: true,
};

export const DEFAULT_BRANDING = {
  storeDisplayName: "Glow Store",
  storeSenderName: "Osman from Glow Store",
  storeWebsiteURL: "https://www.glowstore.com",
  storeTagline: "Skincare that makes you glow",
  storeReplyToEmail: "hello@glowstore.com",
  storeLogo: "",
  storeLogoPosition: "start", // center // end

  emailPrimaryButtonColor: "#108848",
  emailButtonTextColor: "#FFFFFF",
  emailBackgroundColor: "#f9fafb",
  emailHeadingColor: "#303030",
  emailBodyTextColor: "#0d0e0d",
  emailAccentBorderColor: "#f0f0f0",

  emailFooterText: "@2026 glow store ·",
  emailFooterLinkText: "Unsubscribe",
  isShowFooterBadge: true,
};

export const DEFAULT_ADMIN_NOTIFICATION = {
  notificationEmailAddress: {
    email1: "example@gmail.com",
    email2: "example@gmail.com",
    email3: null,
  },
  isNewReviewNotify: true,
  isReviewApprovalNotify: true,
  isLowStarReviewNotify: true,
  isWeeklySummaryNotify: true,
};

export const DEFAULT_SMTP_SETUP = {
  smtpUser: "",
  smtpPassword: "",
  smtpPort: "",
  smtpHost: "",
};
