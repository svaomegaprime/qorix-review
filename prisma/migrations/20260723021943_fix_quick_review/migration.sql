/*
  Warnings:

  - You are about to drop the column `isShowRatingFilter` on the `QuickReviewWidget` table. All the data in the column will be lost.
  - You are about to drop the column `isShowReviewerImage` on the `QuickReviewWidget` table. All the data in the column will be lost.
  - You are about to drop the column `isShowReviewerVideo` on the `QuickReviewWidget` table. All the data in the column will be lost.
  - You are about to drop the column `isshowMediaImageAndVideo` on the `QuickReviewWidget` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "QuickReviewWidget" DROP COLUMN "isShowRatingFilter",
DROP COLUMN "isShowReviewerImage",
DROP COLUMN "isShowReviewerVideo",
DROP COLUMN "isshowMediaImageAndVideo",
ADD COLUMN     "isShowHelpfulButton" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isShowMediaThumbnails" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isShowStarRatingOnCard" BOOLEAN NOT NULL DEFAULT true;
