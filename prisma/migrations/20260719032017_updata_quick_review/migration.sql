-- AlterTable
ALTER TABLE "QuickReviewWidget" ADD COLUMN     "barFileColor" TEXT,
ADD COLUMN     "filterAndSorting" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isShowMediaStrip" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isShowReviewCount" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isShowStarDistribution" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isshowMediaImageAndVideo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showHelfullButton" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "writeReviewButtonText" TEXT NOT NULL DEFAULT 'Write a review';
