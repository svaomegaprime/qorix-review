export const COLOR_PICKERS_ELEMENTS = [
  { key: "STAR_COLOR", label: "Star color" },
  { key: "BADGE_COLOR", label: "Badge color" },
  { key: "ACTIVE_DOT_COLOR", label: "Active dot" },
  { key: "OVERLAY_TINT_COLOR", label: "Overlay tint" },
];

export const DEFAULT_COLOR_VALUES = {
  STAR_COLOR: "#F59E0B",
  ACTIVE_DOT_COLOR: "#34C759",
  BADGE_COLOR: "#34C759",
  OVERLAY_TINT_COLOR: "#1A1A1A",
};

export const DEFAULT_VALUES_VIDEO_STACK = {
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
  showReviewTextBelow: true,
  showVerifiedBadge: true,
  showVideoDuration: true,
  showProductName: true,

  // Video behavior
  showLoopVideo: true,
  mutedByDefault: true,
  autoplayOnHover: true,

  //-------Carousel behavior
  showNavigationDots: true,
  showArrowControls: true,
  thumbnailsShown: 5,
  fiteringMinStart: "ALL",

  // color piker
  startColor: DEFAULT_COLOR_VALUES.STAR_COLOR,
  activeDotColor: DEFAULT_COLOR_VALUES.ACTIVE_DOT_COLOR,
  badgeColor: DEFAULT_COLOR_VALUES.BADGE_COLOR,
  overlayTintColor: DEFAULT_COLOR_VALUES.OVERLAY_TINT_COLOR,
  advanceCss: "",
};
