const DEFAULT_COLOR_VALUES = {
  STAR_COLOR: "#f59e0b",
  BAR_FILE_COLOR: "#34C759",
  TEXT_COLOR: "#fff",
  VERIFIED_BADGE_COLOR: "#1D9E75",
  Submit_Button_Color: "#1D9E75",
};

const DEFAULT_QUICK_REVIEW_STATE = {
  name: true,
  email: true,
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
  showMediaThumbnails: true,
  showProductName: true,
  showVerifiedBadge: true,
  showReviewDate: true,
  showStarRatingOnCard: true,
  showHelpfulButton: true,
  isShowStarDistribution: true,
  isShowMediaStrip: true,
  isShowReviewCount: true,
  isShowRatingBarWithoutRating: true,
  isShowMediaWithoutRating: true,
  isShowReviewDataWithoutRating: true,
  writeReviewButtonText: "Write a review",
  showHelfullButton: true,
  reviewPerPage: 10,
  defaultSort: "ALL",
  filterAndSorting: "FILTER_AND_SORT",
  filterMinStar: "ALL",
};

export const DEFAULT_DB_FORMATED_DATA = {
  // -------- form ----------
  isShowNameField: DEFAULT_QUICK_REVIEW_STATE.name,
  isShowEmailField: DEFAULT_QUICK_REVIEW_STATE.email,
  isPhotoUpload: DEFAULT_QUICK_REVIEW_STATE.photo,
  isVideoUpload: DEFAULT_QUICK_REVIEW_STATE.video,

  formTitle: DEFAULT_QUICK_REVIEW_STATE.formTitle,
  formSubtitle: DEFAULT_QUICK_REVIEW_STATE.formSubtitle,
  submitButtonText: DEFAULT_QUICK_REVIEW_STATE.submitButtonText,
  isShowStarDistribution: DEFAULT_QUICK_REVIEW_STATE.isShowStarDistribution,
  isShowMediaStrip: DEFAULT_QUICK_REVIEW_STATE.isShowMediaStrip,
  isShowReviewCount: DEFAULT_QUICK_REVIEW_STATE.isShowReviewCount,
  isShowRatingBarWithoutRating:
    DEFAULT_QUICK_REVIEW_STATE.isShowRatingBarWithoutRating,
  isShowMediaWithoutRating: DEFAULT_QUICK_REVIEW_STATE.isShowMediaWithoutRating,
  isShowReviewDataWithoutRating:
    DEFAULT_QUICK_REVIEW_STATE.isShowReviewDataWithoutRating,
  showHelfullButton: DEFAULT_QUICK_REVIEW_STATE.showHelfullButton,
  // ---success-----
  successMessageTitle: DEFAULT_QUICK_REVIEW_STATE.successMessageTitle,
  successButtonText: DEFAULT_QUICK_REVIEW_STATE.successButtonText,
  successMessage: DEFAULT_QUICK_REVIEW_STATE.successMessage,
  // ----color--------
  starColor: DEFAULT_COLOR_VALUES.STAR_COLOR,
  buttonBackgroundColor: DEFAULT_COLOR_VALUES.Submit_Button_Color,
  buttonTextColor: DEFAULT_COLOR_VALUES.TEXT_COLOR,
  verifiedBadgeColor: DEFAULT_COLOR_VALUES.VERIFIED_BADGE_COLOR,
  barFileColor: DEFAULT_COLOR_VALUES.BAR_FILE_COLOR,
  // -------------- widget ---------
  borderRadius: `${DEFAULT_QUICK_REVIEW_STATE.borderRadius}px`,

  isShowReviewerName: DEFAULT_QUICK_REVIEW_STATE.showReviewerName,
  isShowMediaThumbnails: DEFAULT_QUICK_REVIEW_STATE.showMediaThumbnails,
  isShowProductName: DEFAULT_QUICK_REVIEW_STATE.showProductName,
  isShowVerifiedBadge: DEFAULT_QUICK_REVIEW_STATE.showVerifiedBadge,
  isShowReviewDate: DEFAULT_QUICK_REVIEW_STATE.showReviewDate,
  isShowStarRatingOnCard: DEFAULT_QUICK_REVIEW_STATE.showStarRatingOnCard,
  isShowHelpfulButton: DEFAULT_QUICK_REVIEW_STATE.showHelpfulButton,
  writeReviewButtonText: DEFAULT_QUICK_REVIEW_STATE.writeReviewButtonText,
  reviewPerPage: Number(DEFAULT_QUICK_REVIEW_STATE.reviewPerPage),
  defaultSort: DEFAULT_QUICK_REVIEW_STATE.defaultSort,
  filterAndSorting: DEFAULT_QUICK_REVIEW_STATE.filterAndSorting,
  filterMinStar: DEFAULT_QUICK_REVIEW_STATE.filterMinStar,
};
