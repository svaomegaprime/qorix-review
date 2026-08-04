-- DropIndex
DROP INDEX "Review_storeId_productId_reviewerEmail_key";

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "orderRecordId" UUID;

-- CreateIndex
CREATE INDEX "Review_storeId_productId_reviewerEmail_idx" ON "Review"("storeId", "productId", "reviewerEmail");

-- CreateIndex
CREATE INDEX "Review_orderRecordId_idx" ON "Review"("orderRecordId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderRecordId_fkey" FOREIGN KEY ("orderRecordId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
