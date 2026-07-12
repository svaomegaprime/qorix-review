/*
  Warnings:

  - A unique constraint covering the columns `[storeId,productId,reviewerEmail]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "redisBullmqJobId" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "Review_storeId_productId_reviewerEmail_key" ON "Review"("storeId", "productId", "reviewerEmail");
