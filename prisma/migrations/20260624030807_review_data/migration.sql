-- DropIndex
DROP INDEX "Review_reviewerEmail_key";

-- DropIndex
DROP INDEX "Review_reviewerPhone_key";

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "status" SET DEFAULT 'PENDING';
