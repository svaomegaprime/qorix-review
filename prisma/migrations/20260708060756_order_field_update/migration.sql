/*
  Warnings:

  - You are about to drop the column `projuctJson` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "projuctJson",
ADD COLUMN     "productsJson" JSONB;

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "source" DROP NOT NULL;
