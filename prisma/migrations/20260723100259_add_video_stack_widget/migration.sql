-- CreateTable
CREATE TABLE "VideoStackSettings" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "showHeader" BOOLEAN NOT NULL DEFAULT true,
    "headerStyle" TEXT NOT NULL DEFAULT 'center',
    "eyebrowLabel" TEXT NOT NULL DEFAULT 'CUSTOMER REVIEWS',
    "heading" TEXT NOT NULL DEFAULT 'Reviews from people',
    "subheading" TEXT NOT NULL DEFAULT 'Watch and hear what our customers have to say.',
    "reviewStats" TEXT NOT NULL DEFAULT 'Show review count & verified badge',
    "showStarDistribution" BOOLEAN NOT NULL DEFAULT true,
    "showReviewerName" BOOLEAN NOT NULL DEFAULT true,
    "showReviewTextBelow" BOOLEAN NOT NULL DEFAULT true,
    "showVerifiedBadge" BOOLEAN NOT NULL DEFAULT true,
    "showVideoDuration" BOOLEAN NOT NULL DEFAULT true,
    "showProductName" BOOLEAN NOT NULL DEFAULT true,
    "showLoopVideo" BOOLEAN NOT NULL DEFAULT true,
    "mutedByDefault" BOOLEAN NOT NULL DEFAULT true,
    "autoplayOnHover" BOOLEAN NOT NULL DEFAULT true,
    "showNavigationDots" BOOLEAN NOT NULL DEFAULT true,
    "showArrowControls" BOOLEAN NOT NULL DEFAULT true,
    "thumbnailsShown" INTEGER NOT NULL DEFAULT 5,
    "fiteringMinStart" TEXT NOT NULL DEFAULT '3 star and above',
    "startColor" TEXT NOT NULL DEFAULT '#F59E0B',
    "activeDotColor" TEXT NOT NULL DEFAULT '#34C759',
    "badgeColor" TEXT NOT NULL DEFAULT '#34C759',
    "overlayTintColor" TEXT NOT NULL DEFAULT '#1A1A1A',
    "advanceCss" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "VideoStackSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoStackSettings_shop_key" ON "VideoStackSettings"("shop");
