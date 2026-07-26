-- CreateTable
CREATE TABLE "ReviewHubWidget" (
    "id" UUID NOT NULL,
    "storeId" TEXT NOT NULL,
    "showHeader" BOOLEAN NOT NULL DEFAULT true,
    "headerStyle" TEXT NOT NULL DEFAULT 'center',
    "eyebrowLabel" TEXT NOT NULL DEFAULT 'CUSTOMER REVIEWS',
    "heading" TEXT NOT NULL DEFAULT 'Reviews from people',
    "subheading" TEXT NOT NULL DEFAULT 'Watch and hear what our customers have to say.',
    "reviewStats" TEXT NOT NULL DEFAULT 'Show review count & verified badge',
    "showStarDistribution" BOOLEAN NOT NULL DEFAULT true,
    "showReviewerName" BOOLEAN NOT NULL DEFAULT true,
    "showReviewTimer" BOOLEAN NOT NULL DEFAULT true,
    "showVerifiedBadge" BOOLEAN NOT NULL DEFAULT true,
    "showMediaAsset" BOOLEAN NOT NULL DEFAULT true,
    "showShareOption" BOOLEAN NOT NULL DEFAULT true,
    "showAppreciationOption" BOOLEAN NOT NULL DEFAULT true,
    "layout" TEXT NOT NULL DEFAULT '3 column grid',
    "filterSorting" TEXT NOT NULL DEFAULT 'Filter & sorting both',
    "reviewsPerPage" TEXT NOT NULL DEFAULT '9 reviews',
    "starColor" TEXT NOT NULL DEFAULT '#34C759',
    "textColor" TEXT NOT NULL DEFAULT '#1A1A1A',
    "verifiedBadgeColor" TEXT NOT NULL DEFAULT '#1D9E75',
    "cardBackgroundColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "borderColor" TEXT NOT NULL DEFAULT '#F0F0F0',
    "filterChipColor" TEXT NOT NULL DEFAULT '#108848',
    "filterChipStarColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "advanceCss" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewHubWidget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReviewHubWidget_storeId_key" ON "ReviewHubWidget"("storeId");

-- AddForeignKey
ALTER TABLE "ReviewHubWidget" ADD CONSTRAINT "ReviewHubWidget_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeGID") ON DELETE CASCADE ON UPDATE CASCADE;
