/*
  Warnings:

  - You are about to drop the column `backgroundColor` on the `QuickReviewWidget` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `QuickReviewWidget` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `QuickReviewWidget` table. All the data in the column will be lost.
  - You are about to drop the column `photo` on the `QuickReviewWidget` table. All the data in the column will be lost.
  - You are about to drop the column `primaryColor` on the `QuickReviewWidget` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryColor` on the `QuickReviewWidget` table. All the data in the column will be lost.
  - You are about to drop the column `showProductName` on the `QuickReviewWidget` table. All the data in the column will be lost.
  - You are about to drop the column `showRatingFilter` on the `QuickReviewWidget` table. All the data in the column will be lost.
  - You are about to drop the column `showReviewDate` on the `QuickReviewWidget` table. All the data in the column will be lost.
  - You are about to drop the column `showReviewerImage` on the `QuickReviewWidget` table. All the data in the column will be lost.
  - You are about to drop the column `showReviewerName` on the `QuickReviewWidget` table. All the data in the column will be lost.
  - You are about to drop the column `showReviewerVideo` on the `QuickReviewWidget` table. All the data in the column will be lost.
  - You are about to drop the column `showVerifiedBadge` on the `QuickReviewWidget` table. All the data in the column will be lost.
  - You are about to drop the column `video` on the `QuickReviewWidget` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "QuickReviewWidget" DROP COLUMN "backgroundColor",
DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "photo",
DROP COLUMN "primaryColor",
DROP COLUMN "secondaryColor",
DROP COLUMN "showProductName",
DROP COLUMN "showRatingFilter",
DROP COLUMN "showReviewDate",
DROP COLUMN "showReviewerImage",
DROP COLUMN "showReviewerName",
DROP COLUMN "showReviewerVideo",
DROP COLUMN "showVerifiedBadge",
DROP COLUMN "video",
ADD COLUMN     "buttonBackgroundColor" TEXT,
ADD COLUMN     "buttonTextColor" TEXT,
ADD COLUMN     "isPhotoUpload" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isShowEmailField" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isShowNameField" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isShowProductName" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isShowRatingFilter" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isShowReviewDate" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isShowReviewerImage" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isShowReviewerName" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isShowReviewerVideo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isShowVerifiedBadge" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isVideoUpload" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "starColor" TEXT,
ADD COLUMN     "verifiedBadgeColor" TEXT,
ALTER COLUMN "defaultSort" SET DEFAULT 'MOST_RECENT';
