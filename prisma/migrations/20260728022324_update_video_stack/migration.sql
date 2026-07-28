/*
  Warnings:

  - The primary key for the `VideoStackSettings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `shop` on the `VideoStackSettings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[storeId]` on the table `VideoStackSettings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `storeId` to the `VideoStackSettings` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `VideoStackSettings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "VideoStackSettings_shop_key";

-- AlterTable
ALTER TABLE "VideoStackSettings" DROP CONSTRAINT "VideoStackSettings_pkey",
DROP COLUMN "shop",
ADD COLUMN     "storeId" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "VideoStackSettings_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "VideoStackSettings_storeId_key" ON "VideoStackSettings"("storeId");

-- AddForeignKey
ALTER TABLE "VideoStackSettings" ADD CONSTRAINT "VideoStackSettings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeGID") ON DELETE CASCADE ON UPDATE CASCADE;
