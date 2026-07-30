-- AlterTable
ALTER TABLE "QuickReviewWidget" ADD COLUMN     "isShowMediaWithoutRating" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isShowRatingBarWithoutRating" BOOLEAN NOT NULL DEFAULT true;
