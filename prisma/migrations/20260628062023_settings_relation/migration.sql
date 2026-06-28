/*
  Warnings:

  - A unique constraint covering the columns `[storeSettingsId]` on the table `AdminNotification` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[adminNotificationId]` on the table `AdminNotificationEmail` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeSettingsId]` on the table `BrandingSettings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeSettingsId]` on the table `PublishingModeration` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeSettingsId]` on the table `WidgetsSettings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AdminNotification_storeSettingsId_key" ON "AdminNotification"("storeSettingsId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminNotificationEmail_adminNotificationId_key" ON "AdminNotificationEmail"("adminNotificationId");

-- CreateIndex
CREATE UNIQUE INDEX "BrandingSettings_storeSettingsId_key" ON "BrandingSettings"("storeSettingsId");

-- CreateIndex
CREATE UNIQUE INDEX "PublishingModeration_storeSettingsId_key" ON "PublishingModeration"("storeSettingsId");

-- CreateIndex
CREATE UNIQUE INDEX "WidgetsSettings_storeSettingsId_key" ON "WidgetsSettings"("storeSettingsId");
