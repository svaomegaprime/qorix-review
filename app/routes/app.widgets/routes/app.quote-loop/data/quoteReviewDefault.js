export const COLOR_PICKERS_ELEMENTS = [
  {
    key: "Card_Background_Color",
    label: "Card background",
  },
  {
    key: "TEXT_COLOR",
    label: "Review text",
  },
  {
    key: "QUOTE_MARK_COLOR",
    label: "Quote mark and badge color",
  },
  {
    key: "STAR_COLOR",
    label: "Star color",
  },
];

export const DEFAULT_COLOR_VALUES = {
  STAR_COLOR: "#F59E0B",
  TEXT_COLOR: "#303030",
  QUOTE_MARK_COLOR: "#1D9E75",
  Card_Background_Color: "#FFFFFF",
};

export const DEFAULT_QUOTE_LOOP_SETTINGS = {
  advanceCss: "",
  autoSlider: false,
  cardBackgroundColor: "#FFFFFF",
  eyebrowLabel: "CUSTOMER REVIEWS",
  filterSorting: "Filter & sorting both",
  fiteringMinStart: "3 star and above",
  headerStyle: "center",
  heading: "Reviews from people",
  quoteFontSize: 24,
  quoteMarkColor: "#1D9E75",
  reviewStats: "Show review count & verified badge",
  showAppreciationOption: true,
  showArrowControls: true,
  showHeader: true,
  showMediaAsset: true,
  showProductName: true,
  showQuoteMarkIcon: true,
  showReviewerName: true,
  showStarDistribution: true,
  showVerifiedBadge: true,
  speed: 450,
  starColor: "#F59E0B",
  subheading: "Watch and hear what our customers have to say.",
  textColor: "#303030",
  textLength: 160,
};

export const createDefaultSettings = () => ({
  ...DEFAULT_QUOTE_LOOP_SETTINGS,
  colors: { ...DEFAULT_COLOR_VALUES },
});
