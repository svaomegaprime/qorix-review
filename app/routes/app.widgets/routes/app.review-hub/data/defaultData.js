export const COLOR_PICKERS_ELEMENTS = [
  {
    key: "STAR_COLOR",
    label: "Star color",
  },
  {
    key: "TEXT_COLOR",
    label: "Text color",
  },
  {
    key: "VERIFIED_BADGE_COLOR",
    label: "Verified badge color",
  },
  {
    key: "Card_Background_Color",
    label: "Card background",
  },
  {
    key: "Border_Color",
    label: "Border color",
  },
  {
    key: "FILTER_CHIP_COLOR",
    label: "Filter chip (active)",
  },
  {
    key: "FILTER_CHIP_COLOR_STAR_COLOR",
    label: "Filter chip star color (active)",
  },
];

export const DEFAULT_COLOR_VALUES = {
  STAR_COLOR: "#34C759",
  TEXT_COLOR: "#1A1A1A",
  VERIFIED_BADGE_COLOR: "#1D9E75",
  Card_Background_Color: "#FFFFFF",
  Border_Color: "#F0F0F0",
  FILTER_CHIP_COLOR: "#108848",
  FILTER_CHIP_COLOR_STAR_COLOR: "#FFFFFF",
};

export const DEFAULT_REVIEW_HUB_DATA = {
  // Header option
  showHeader: true,
  headerStyle: "center",
  eyebrowLabel: "CUSTOMER REVIEWS",
  heading: "Reviews from people",
  subheading: "Watch and hear what our customers have to say.",
  reviewStats: "Show review count & verified badge",
  // Display elements
  showStarDistribution: true,
  showReviewerName: true,
  showReviewTimer: true,
  showVerifiedBadge: true,
  showMediaAsset: true,
  showShareOption: true,
  showAppreciationOption: true,
  // -------Carousel behavior
  layout: "3",
  filterSorting: "FILTER_AND_SORTING",
  reviewsPerPage: 9,
  filterMinStar: "ALL",
  // color piker

  colors: { ...DEFAULT_COLOR_VALUES },
  // advance css
  advanceCss: "",
};

export const DEFAULT_REVIEW_HUB_DB_DATA = {
  // Header option
  showHeader: true,
  headerStyle: "center",
  eyebrowLabel: "CUSTOMER REVIEWS",
  heading: "Reviews from people",
  subheading: "Watch and hear what our customers have to say.",
  reviewStats: "Show review count & verified badge",

  // Display elements
  showStarDistribution: true,
  showReviewerName: true,
  showReviewTimer: true,
  showVerifiedBadge: true,
  showMediaAsset: true,
  showShareOption: true,
  showAppreciationOption: true,

  // Carousel behavior
  layout: "3",
  filterSorting: "FILTER_AND_SORTING",
  reviewsPerPage: 9,
  filterMinStar: "ALL",

  // Colors
  starColor: DEFAULT_COLOR_VALUES.STAR_COLOR,
  textColor: DEFAULT_COLOR_VALUES.TEXT_COLOR,
  verifiedBadgeColor: DEFAULT_COLOR_VALUES.VERIFIED_BADGE_COLOR,
  cardBackgroundColor: DEFAULT_COLOR_VALUES.Card_Background_Color,
  borderColor: DEFAULT_COLOR_VALUES.Border_Color,
  filterChipColor: DEFAULT_COLOR_VALUES.FILTER_CHIP_COLOR,
  filterChipStarColor: DEFAULT_COLOR_VALUES.FILTER_CHIP_COLOR_STAR_COLOR,

  // Advanced CSS
  advanceCss: "",
};
