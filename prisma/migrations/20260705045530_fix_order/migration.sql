/*
  Warnings:

  - A unique constraint covering the columns `[storeId,orderId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Order_orderId_key";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "currency" TEXT,
ADD COLUMN     "totalPrice" TEXT,
ALTER COLUMN "userEmail" DROP NOT NULL,
ALTER COLUMN "projuctJson" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_storeId_orderId_key" ON "Order"("storeId", "orderId");
