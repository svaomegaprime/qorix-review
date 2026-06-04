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
  isShowWidgetOnProductPage: true,
  isShowStarRatingBadge: true,
  isShowVerifiedPurchaseBadge: true,
  isShowReviewerPhotos: true,
  reviewsPerPage: 10,
  reviewSortOrder: "RECENT", //RATED// HELPFUL
};

export const DEFAULT_BRANDING = {
  storeLogo: "",
  brandColor: "#001555",
  emailSenderName: "Store Name",
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
  notificationFrequency: "IMMEDIATELY", // WEEKLY // DAILY
};
