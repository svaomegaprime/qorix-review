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
  FILTER_CHIP_COLOR_STAR_COLOR: "#fff",
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

  // Colors
  starColor: "#34C759",
  textColor: "#1A1A1A",
  verifiedBadgeColor: "#1D9E75",
  cardBackgroundColor: "#FFFFFF",
  borderColor: "#F0F0F0",
  filterChipColor: "#108848",
  filterChipStarColor: "#FFFFFF",

  // Advanced CSS
  advanceCss: "",
};
