/*
  Warnings:

  - The `reviewsPerPage` column on the `ReviewHubWidget` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ReviewHubWidget" ALTER COLUMN "filterSorting" SET DEFAULT 'FILTER_AND_SORTING',
DROP COLUMN "reviewsPerPage",
ADD COLUMN     "reviewsPerPage" INTEGER NOT NULL DEFAULT 6;
