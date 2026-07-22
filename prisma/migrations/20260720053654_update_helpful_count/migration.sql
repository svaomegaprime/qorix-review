/*
  Warnings:

  - You are about to drop the column `count` on the `HelpfulCount` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `HelpfulCount` table. All the data in the column will be lost.
  - Added the required column `customerEmail` to the `HelpfulCount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isHelpful` to the `HelpfulCount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HelpfulCount" DROP COLUMN "count",
DROP COLUMN "email",
ADD COLUMN     "customerEmail" TEXT NOT NULL,
ADD COLUMN     "isHelpful" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "QuickReviewWidget" ALTER COLUMN "isShowEmailField" SET DEFAULT true,
ALTER COLUMN "starColor" SET DEFAULT '#f59e0b',
ALTER COLUMN "buttonBackgroundColor" SET DEFAULT '#1D9E75',
ALTER COLUMN "buttonTextColor" SET DEFAULT '#fff',
ALTER COLUMN "verifiedBadgeColor" SET DEFAULT '#1D9E75',
ALTER COLUMN "borderRadius" SET DEFAULT '15px',
ALTER COLUMN "isShowProductName" SET DEFAULT true,
ALTER COLUMN "barFileColor" SET DEFAULT '#34C759';
