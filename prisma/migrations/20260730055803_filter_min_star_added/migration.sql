-- CreateEnum
CREATE TYPE "FilterMinStars" AS ENUM ('ALL', 'STAR_1', 'STAR_2', 'STAR_3', 'STAR_4', 'STAR_5');

-- AlterTable
ALTER TABLE "QuickReviewWidget" ADD COLUMN     "filterMinStar" "FilterMinStars" NOT NULL DEFAULT 'ALL';
