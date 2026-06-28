/*
  Warnings:

  - A unique constraint covering the columns `[storeSettingsId]` on the table `EmailSettings` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "EmailSettings" ADD COLUMN     "replyEmailBody" TEXT,
ADD COLUMN     "replyEmailButton" TEXT,
ADD COLUMN     "replyEmailSubjectLine" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "EmailSettings_storeSettingsId_key" ON "EmailSettings"("storeSettingsId");
