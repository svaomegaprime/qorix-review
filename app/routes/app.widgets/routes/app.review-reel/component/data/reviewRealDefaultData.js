// Color picker list — UI te loop kore ColorPicker component render korte use hoy
export const COLOR_PICKERS_ELEMENTS = [
  { key: "CARD_BACKGROUND", label: "Card background" },
  { key: "CARD_TEXT_COLOR", label: "Card text color" },
  { key: "BADGE_COLOR", label: "Badge & Star color" },
  { key: "ACTIVE_DOT_COLOR", label: "Active dot" },
];

// Color picker gulor default color value — DEFAULT_VALUES_REVIEW_REEL banate use hoy
export const DEFAULT_COLOR_VALUES = {
  BADGE_COLOR: "#34C759",
  ACTIVE_DOT_COLOR: "#34C759",
  CARD_BACKGROUND: "#FFF",
  CARD_TEXT_COLOR: "#000",
};

// Review Reel widget-er shob settings-er default value — loader e row na paile eta return hoy
export const DEFAULT_VALUES_REVIEW_REEL = {
  // Header option
  showHeader: true,
  headerStyle: "center",
  eyebrowLabel: "CUSTOMER REVIEWS",
  heading: "Real reviews from real people",
  subheading: "Watch and hear what our customers have to say.",
  reviewStats: "Show review count & verified badge",

  // Display elements
  showReviewerName: true,
  showReviewImage: true,
  showVerifiedBadge: true,
  showProductName: true,
  showReviewDate: true,

  //-------Carousel behavior
  showAutoPlay: true,
  showNavigationDots: true,
  showArrowControls: true,
  autoplaySpeed: 4,
  cardsVisible: 3,
  fiteringMinStart: "ALL",

  // color piker
  startColor: DEFAULT_COLOR_VALUES.BADGE_COLOR,
  activeDotColor: DEFAULT_COLOR_VALUES.ACTIVE_DOT_COLOR,
  cardBackgorud: DEFAULT_COLOR_VALUES.CARD_BACKGROUND,
  cardTextColor: DEFAULT_COLOR_VALUES.CARD_TEXT_COLOR,
  advanceCss: "",
};
