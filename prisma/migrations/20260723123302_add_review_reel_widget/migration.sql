-- CreateTable
CREATE TABLE "ReviewReelSettings" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "showHeader" BOOLEAN NOT NULL DEFAULT true,
    "headerStyle" TEXT NOT NULL DEFAULT 'center',
    "eyebrowLabel" TEXT NOT NULL DEFAULT 'CUSTOMER REVIEWS',
    "heading" TEXT NOT NULL DEFAULT 'Real reviews from real people',
    "subheading" TEXT NOT NULL DEFAULT 'Watch and hear what our customers have to say.',
    "reviewStats" TEXT NOT NULL DEFAULT 'Show review count & verified badge',
    "showReviewerName" BOOLEAN NOT NULL DEFAULT true,
    "showReviewImage" BOOLEAN NOT NULL DEFAULT true,
    "showVerifiedBadge" BOOLEAN NOT NULL DEFAULT true,
    "showProductName" BOOLEAN NOT NULL DEFAULT true,
    "showReviewDate" BOOLEAN NOT NULL DEFAULT true,
    "showAutoPlay" BOOLEAN NOT NULL DEFAULT true,
    "showNavigationDots" BOOLEAN NOT NULL DEFAULT true,
    "showArrowControls" BOOLEAN NOT NULL DEFAULT true,
    "autoplaySpeed" INTEGER NOT NULL DEFAULT 4,
    "cardsVisible" INTEGER NOT NULL DEFAULT 3,
    "fiteringMinStart" TEXT NOT NULL DEFAULT '3 star and above',
    "startColor" TEXT NOT NULL DEFAULT '#34C759',
    "activeDotColor" TEXT NOT NULL DEFAULT '#34C759',
    "cardBackgorud" TEXT NOT NULL DEFAULT '#FFF',
    "cardTextColor" TEXT NOT NULL DEFAULT '#000',
    "advanceCss" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "ReviewReelSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReviewReelSettings_shop_key" ON "ReviewReelSettings"("shop");
