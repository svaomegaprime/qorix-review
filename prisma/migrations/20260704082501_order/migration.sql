-- CreateEnum
CREATE TYPE "ReviewCheckStatus" AS ENUM ('SENT', 'OPENED', 'PANDING', 'REVIEWED', 'FAILED');

-- CreateTable
CREATE TABLE "Order" (
    "id" UUID NOT NULL,
    "storeId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fulfillmentStatus" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "projuctJson" JSONB NOT NULL,
    "reviewCheckStatus" "ReviewCheckStatus" NOT NULL DEFAULT 'PANDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_userEmail_key" ON "Order"("userEmail");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeGID") ON DELETE CASCADE ON UPDATE CASCADE;
