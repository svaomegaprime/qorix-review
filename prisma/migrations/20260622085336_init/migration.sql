-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'BASIC', 'PRO');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED', 'SPAM', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "ReviewSource" AS ENUM ('DEMO', 'REQUEST_EMAIL', 'PRODUCT_PAGE');

-- CreateEnum
CREATE TYPE "ReviewSortOrder" AS ENUM ('RECENT', 'RATED', 'HELPFUL');

-- CreateEnum
CREATE TYPE "MinimumStarRatingToDisplay" AS ENUM ('ALL_RATINGS', 'ONE_STAR', 'TWO_STAR', 'THREE_STAR', 'FOUR_STAR', 'FIVE_STAR');

-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('VIDEO', 'IMAGE');

-- CreateEnum
CREATE TYPE "AutoPublishRules" AS ENUM ('AUTO_PUBLISH', 'VERIFIED_ONLY', 'MANUAL_PUBLISH');

-- CreateTable
CREATE TABLE "Review" (
    "id" UUID NOT NULL,
    "storeId" TEXT NOT NULL,
    "productId" TEXT,
    "productHandle" TEXT,
    "reviewerName" TEXT,
    "reviewerEmail" TEXT,
    "reviewerPhone" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "status" "ReviewStatus" NOT NULL,
    "source" "ReviewSource" NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpfulCount" (
    "id" UUID NOT NULL,
    "reviewId" UUID NOT NULL,
    "count" INTEGER NOT NULL,
    "customerId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpfulCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" UUID NOT NULL,
    "type" "AttachmentType",
    "url" TEXT,
    "reviewId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreSettings" (
    "id" UUID NOT NULL,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestScheduling" (
    "id" UUID NOT NULL,
    "storeSettingsId" UUID NOT NULL,
    "isAutomaticRequest" BOOLEAN NOT NULL DEFAULT true,
    "sendRequestAfterDelivery" INTEGER NOT NULL DEFAULT 5,
    "isReminderRequest" BOOLEAN NOT NULL DEFAULT true,
    "reminderRequestDelay" INTEGER NOT NULL DEFAULT 5,
    "isSkipRefundedOrder" BOOLEAN NOT NULL DEFAULT true,
    "isSkipCancelledOrder" BOOLEAN NOT NULL DEFAULT true,
    "minimumOrderValue" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestScheduling_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailSettings" (
    "id" UUID NOT NULL,
    "storeSettingsId" UUID NOT NULL,
    "smtpUser" TEXT,
    "smtpPassword" TEXT,
    "smtpPort" INTEGER,
    "smtpHost" TEXT,
    "requestEmailSubjectLine" TEXT,
    "requestEmailBody" TEXT,
    "requestEmailButton" TEXT,
    "reminderSubjectLine" TEXT,
    "reminderEmailBody" TEXT,
    "reminderEmailButton" TEXT,
    "isConfirmationReviewEmail" BOOLEAN NOT NULL DEFAULT true,
    "confirmationEmailSubject" TEXT,
    "confirmationEmailBody" TEXT,
    "isReplyReviewEmail" BOOLEAN NOT NULL DEFAULT false,
    "replyReviewEmailSubject" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublishingModeration" (
    "id" UUID NOT NULL,
    "storeSettingsId" UUID NOT NULL,
    "autoPublishRules" "AutoPublishRules" NOT NULL DEFAULT 'AUTO_PUBLISH',
    "isLowRatingHold" BOOLEAN NOT NULL DEFAULT true,
    "isProfanityFilter" BOOLEAN NOT NULL DEFAULT true,
    "isPersonalInfoFilter" BOOLEAN NOT NULL DEFAULT true,
    "isSpamFilter" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublishingModeration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WidgetsSettings" (
    "id" UUID NOT NULL,
    "storeSettingsId" UUID NOT NULL,
    "defaultStarColor" TEXT NOT NULL DEFAULT '#F59E0B',
    "defaultFontSize" TEXT NOT NULL DEFAULT '14px',
    "defaultBorderRadius" TEXT NOT NULL DEFAULT '8px',
    "isShowVerifiedBadge" BOOLEAN NOT NULL DEFAULT true,
    "isShowReviewerName" BOOLEAN NOT NULL DEFAULT true,
    "isShowReviewerDate" BOOLEAN NOT NULL DEFAULT true,
    "reviewsPerPage" INTEGER NOT NULL DEFAULT 10,
    "reviewSortOrder" "ReviewSortOrder" NOT NULL DEFAULT 'RECENT',
    "minimumStarRatingToDisplay" "MinimumStarRatingToDisplay" NOT NULL DEFAULT 'ALL_RATINGS',
    "isShowMediaFirst" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WidgetsSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandingSettings" (
    "id" UUID NOT NULL,
    "storeSettingsId" UUID NOT NULL,
    "storeDisplayName" TEXT NOT NULL DEFAULT 'Glow Store',
    "storeSenderName" TEXT NOT NULL DEFAULT 'Osman from Glow Store',
    "storeWebsiteURL" TEXT NOT NULL DEFAULT 'https://www.glowstore.com',
    "storeTagline" TEXT NOT NULL DEFAULT 'Skincare that makes you glow',
    "storeReplyToEmail" TEXT NOT NULL DEFAULT 'hello@glowstore.com',
    "storeLogo" TEXT NOT NULL DEFAULT '',
    "storeLogoPosition" TEXT NOT NULL DEFAULT 'LEFT',
    "emailPrimaryButtonColor" TEXT NOT NULL DEFAULT '#FE0606',
    "emailButtonTextColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "emailBackgroundColor" TEXT NOT NULL DEFAULT '#f9fafb',
    "emailHeadingColor" TEXT NOT NULL DEFAULT '#303030',
    "emailBodyTextColor" TEXT NOT NULL DEFAULT '#108848',
    "emailAccentBorderColor" TEXT NOT NULL DEFAULT '#f0f0f0',
    "emailFooterText" TEXT NOT NULL DEFAULT '@2026 glow store ·',
    "emailFooterLinkText" TEXT NOT NULL DEFAULT 'Unsubscribe',
    "isShowFooterBadge" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminNotification" (
    "id" UUID NOT NULL,
    "storeSettingsId" UUID NOT NULL,
    "isNewReviewNotify" BOOLEAN NOT NULL DEFAULT true,
    "isReviewApprovalNotify" BOOLEAN NOT NULL DEFAULT true,
    "isLowStarReviewNotify" BOOLEAN NOT NULL DEFAULT true,
    "isWeeklySummaryNotify" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminNotificationEmail" (
    "id" UUID NOT NULL,
    "adminNotificationId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminNotificationEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustBarWidget" (
    "id" UUID NOT NULL,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrustBarWidget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    "refreshToken" TEXT,
    "refreshTokenExpires" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" UUID NOT NULL,
    "storeGID" TEXT NOT NULL,
    "storeURL" TEXT NOT NULL,
    "storeEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" UUID NOT NULL,
    "storeId" TEXT NOT NULL,
    "plan" "PlanType" NOT NULL DEFAULT 'FREE',
    "planHandle" TEXT,
    "subscriptionId" TEXT,
    "status" TEXT NOT NULL,
    "trialEndsAt" TIMESTAMP(3),
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Review_reviewerEmail_key" ON "Review"("reviewerEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Review_reviewerPhone_key" ON "Review"("reviewerPhone");

-- CreateIndex
CREATE INDEX "Review_storeId_idx" ON "Review"("storeId");

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE INDEX "Review_status_idx" ON "Review"("status");

-- CreateIndex
CREATE INDEX "Review_reviewerEmail_idx" ON "Review"("reviewerEmail");

-- CreateIndex
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StoreSettings_storeId_key" ON "StoreSettings"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "RequestScheduling_storeSettingsId_key" ON "RequestScheduling"("storeSettingsId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminNotificationEmail_email_key" ON "AdminNotificationEmail"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Store_storeGID_key" ON "Store"("storeGID");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_storeId_key" ON "Subscription"("storeId");

-- CreateIndex
CREATE INDEX "Subscription_plan_idx" ON "Subscription"("plan");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeGID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpfulCount" ADD CONSTRAINT "HelpfulCount_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreSettings" ADD CONSTRAINT "StoreSettings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeGID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestScheduling" ADD CONSTRAINT "RequestScheduling_storeSettingsId_fkey" FOREIGN KEY ("storeSettingsId") REFERENCES "StoreSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailSettings" ADD CONSTRAINT "EmailSettings_storeSettingsId_fkey" FOREIGN KEY ("storeSettingsId") REFERENCES "StoreSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublishingModeration" ADD CONSTRAINT "PublishingModeration_storeSettingsId_fkey" FOREIGN KEY ("storeSettingsId") REFERENCES "StoreSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WidgetsSettings" ADD CONSTRAINT "WidgetsSettings_storeSettingsId_fkey" FOREIGN KEY ("storeSettingsId") REFERENCES "StoreSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandingSettings" ADD CONSTRAINT "BrandingSettings_storeSettingsId_fkey" FOREIGN KEY ("storeSettingsId") REFERENCES "StoreSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminNotification" ADD CONSTRAINT "AdminNotification_storeSettingsId_fkey" FOREIGN KEY ("storeSettingsId") REFERENCES "StoreSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminNotificationEmail" ADD CONSTRAINT "AdminNotificationEmail_adminNotificationId_fkey" FOREIGN KEY ("adminNotificationId") REFERENCES "AdminNotification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustBarWidget" ADD CONSTRAINT "TrustBarWidget_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeGID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeGID") ON DELETE CASCADE ON UPDATE CASCADE;
