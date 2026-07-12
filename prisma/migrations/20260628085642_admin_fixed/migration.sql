/*
  Warnings:

  - You are about to drop the `AdminNotificationEmail` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `notificationEmailAddress` to the `AdminNotification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AdminNotificationEmail" DROP CONSTRAINT "AdminNotificationEmail_adminNotificationId_fkey";

-- AlterTable
ALTER TABLE "AdminNotification" ADD COLUMN     "notificationEmailAddress" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "BrandingSettings" ALTER COLUMN "storeLogo" SET DEFAULT 'https://www.glowstore.com';

-- DropTable
DROP TABLE "AdminNotificationEmail";
