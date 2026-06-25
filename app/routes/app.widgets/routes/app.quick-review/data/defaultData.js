const DEFAULT_COLOR_VALUES = {
  STAR_COLOR: "#f59e0b",
  TEXT_COLOR: "#fff",
  VERIFIED_BADGE_COLOR: "#1D9E75",
  Submit_Button_Color: "#1D9E75",
};

const DEFAULT_QUICK_REVIEW_STATE = {
  name: true,
  email: false,
  photo: true,
  video: true,
  formTitle: "How was your experience?",
  formSubtitle: "Your feedback helps others",
  submitButtonText: "Submit review",
  successMessageTitle: "Review submitted!",
  successButtonText: "Continue Shopping",
  successMessage:
    "Thank you for your review. It has been submitted successfully.",
  colorValues: DEFAULT_COLOR_VALUES,
  borderRadius: 15,
  showReviewerName: true,
  showReviewerImage: true,
  showReviewerVideo: true,
  showProductName: false,
  showVerifiedBadge: true,
  showReviewDate: true,
  showRatingFilter: true,
  reviewPerPage: 10,
  defaultSort: "MOST_RECENT",
};


  const dbFormatedData = {
    // -------- form ----------
    isShowNameField: DEFAULT_QUICK_REVIEW_STATE.name,
    isShowEmailField: DEFAULT_QUICK_REVIEW_STATE.email,
    isPhotoUpload: DEFAULT_QUICK_REVIEW_STATE.photo,
    isVideoUpload: DEFAULT_QUICK_REVIEW_STATE.video,

    formTitle: DEFAULT_QUICK_REVIEW_STATE.formTitle,
    formSubtitle: DEFAULT_QUICK_REVIEW_STATE.formSubtitle,
    submitButtonText: DEFAULT_QUICK_REVIEW_STATE.submitButtonText,
    // ---success-----
    successMessageTitle: DEFAULT_QUICK_REVIEW_STATE.successMessageTitle,
    successButtonText: DEFAULT_QUICK_REVIEW_STATE.successButtonText,
    successMessage: DEFAULT_QUICK_REVIEW_STATE.successMessage,
    // ----color--------
    starColor: DEFAULT_COLOR_VALUES.colorValues.STAR_COLOR,
    buttonBackgroundColor: DEFAULT_COLOR_VALUES.colorValues.Submit_Button_Color,
    buttonTextColor: DEFAULT_COLOR_VALUES.colorValues.TEXT_COLOR,
    verifiedBadgeColor: DEFAULT_COLOR_VALUES.colorValues.VERIFIED_BADGE_COLOR,
    // -------------- widget ---------
    borderRadius: `${DEFAULT_QUICK_REVIEW_STATE.borderRadius}px`,

    isShowReviewerName: DEFAULT_QUICK_REVIEW_STATE.showReviewerName,
    isShowReviewerImage: DEFAULT_QUICK_REVIEW_STATE.showReviewerImage,
    isShowReviewerVideo: DEFAULT_QUICK_REVIEW_STATE.showReviewerVideo,
    isShowProductName: DEFAULT_QUICK_REVIEW_STATE.showProductName,
    isShowVerifiedBadge: DEFAULT_QUICK_REVIEW_STATE.showVerifiedBadge,
    isShowReviewDate: DEFAULT_QUICK_REVIEW_STATE.showReviewDate,
    isShowRatingFilter: DEFAULT_QUICK_REVIEW_STATE.showRatingFilter,

    reviewPerPage: Number(DEFAULT_QUICK_REVIEW_STATE.reviewPerPage),
    defaultSort: DEFAULT_QUICK_REVIEW_STATE.defaultSort,
  };