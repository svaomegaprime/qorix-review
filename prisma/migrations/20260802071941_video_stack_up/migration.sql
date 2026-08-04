/*
  Warnings:

  - The `fiteringMinStart` column on the `VideoStackSettings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "VideoStackSettings" DROP COLUMN "fiteringMinStart",
ADD COLUMN     "fiteringMinStart" "FilterMinStars" NOT NULL DEFAULT 'ALL';
