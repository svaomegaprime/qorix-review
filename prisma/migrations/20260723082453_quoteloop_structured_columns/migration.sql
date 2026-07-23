/*
  Warnings:

  - You are about to drop the column `settings` on the `QuoteLoopWidget` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "QuoteLoopWidget" DROP COLUMN "settings",
ADD COLUMN     "advanceCss" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "autoSlider" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cardBackgroundColor" TEXT NOT NULL DEFAULT '#FFFFFF',
ADD COLUMN     "eyebrowLabel" TEXT NOT NULL DEFAULT 'CUSTOMER REVIEWS',
ADD COLUMN     "filterSorting" TEXT NOT NULL DEFAULT 'Filter & sorting both',
ADD COLUMN     "fiteringMinStart" TEXT NOT NULL DEFAULT '3 star and above',
ADD COLUMN     "headerStyle" TEXT NOT NULL DEFAULT 'center',
ADD COLUMN     "heading" TEXT NOT NULL DEFAULT 'Reviews from people',
ADD COLUMN     "quoteFontSize" INTEGER NOT NULL DEFAULT 24,
ADD COLUMN     "quoteMarkColor" TEXT NOT NULL DEFAULT '#1D9E75',
ADD COLUMN     "reviewStats" TEXT NOT NULL DEFAULT 'Show review count & verified badge',
ADD COLUMN     "showAppreciationOption" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showArrowControls" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showHeader" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showMediaAsset" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showProductName" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showQuoteMarkIcon" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showReviewerName" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showStarDistribution" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showVerifiedBadge" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "speed" INTEGER NOT NULL DEFAULT 450,
ADD COLUMN     "starColor" TEXT NOT NULL DEFAULT '#F59E0B',
ADD COLUMN     "subheading" TEXT NOT NULL DEFAULT 'Watch and hear what our customers have to say.',
ADD COLUMN     "textColor" TEXT NOT NULL DEFAULT '#303030',
ADD COLUMN     "textLength" INTEGER NOT NULL DEFAULT 160;
