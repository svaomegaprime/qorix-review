-- CreateEnum
CREATE TYPE "ReviewCheckStatus" AS ENUM ('SENT', 'OPENED', 'PENDING', 'REVIEWED', 'FAILED');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('AUTOMATIC', 'MANUAL', 'REMINDER');

-- CreateEnum
CREATE TYPE "FilterMinStars" AS ENUM ('ALL', 'STAR_1', 'STAR_2', 'STAR_3', 'STAR_4', 'STAR_5');

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
CREATE TABLE "Order" (
    "id" UUID NOT NULL,
    "storeId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fulfillmentStatus" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "userEmail" TEXT,
    "reviewCheckStatus" "ReviewCheckStatus" NOT NULL DEFAULT 'PENDING',
    "requestType" "RequestType" NOT NULL DEFAULT 'AUTOMATIC',
    "totalPrice" TEXT,
    "currency" TEXT,
    "redisBullmqJobId" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderLineItem" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "productId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "handle" TEXT,
    "url" TEXT,
    "image" TEXT,
    "isReviewed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" UUID NOT NULL,
    "storeId" TEXT NOT NULL,
    "productId" TEXT,
    "productHandle" TEXT,
    "productTitle" TEXT,
    "reviewerName" TEXT,
    "reviewerEmail" TEXT,
    "reviewerPhone" TEXT,
    "productImage" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT,
    "body" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "source" "ReviewSource",
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpfulCount" (
    "id" UUID NOT NULL,
    "reviewId" UUID NOT NULL,
    "isHelpful" BOOLEAN NOT NULL,
    "customerId" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
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
CREATE TABLE "Reply" (
    "id" UUID NOT NULL,
    "body" TEXT,
    "reviewId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reply_pkey" PRIMARY KEY ("id")
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
    "replyEmailSubjectLine" TEXT,
    "replyEmailBody" TEXT,
    "replyEmailButton" TEXT,
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
    "storeLogo" TEXT NOT NULL DEFAULT 'https://www.glowstore.com',
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
    "notificationEmailAddress" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustBarWidget" (
    "id" UUID NOT NULL,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "starColor" TEXT NOT NULL DEFAULT '#F59E0B',
    "textColor" TEXT NOT NULL DEFAULT '#1A1A1A',
    "verifiedBadgeColor" TEXT NOT NULL DEFAULT '#088728',
    "fontSize" INTEGER NOT NULL DEFAULT 16,
    "starSize" INTEGER NOT NULL DEFAULT 16,
    "fontWeight" TEXT NOT NULL DEFAULT 'MEDIUM',
    "showAverageRating" BOOLEAN NOT NULL DEFAULT true,
    "showReviewCount" BOOLEAN NOT NULL DEFAULT true,
    "showVerifiedBadge" BOOLEAN NOT NULL DEFAULT true,
    "reviewSource" TEXT NOT NULL DEFAULT 'DEMO_REVIEW_SOURCE',
    "hideIfNoReviews" BOOLEAN NOT NULL DEFAULT true,
    "advanceCss" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "TrustBarWidget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuickReviewWidget" (
    "id" UUID NOT NULL,
    "storeId" TEXT NOT NULL,
    "isShowNameField" BOOLEAN NOT NULL DEFAULT true,
    "isShowEmailField" BOOLEAN NOT NULL DEFAULT true,
    "isPhotoUpload" BOOLEAN NOT NULL DEFAULT true,
    "isVideoUpload" BOOLEAN NOT NULL DEFAULT true,
    "formTitle" TEXT NOT NULL DEFAULT 'How was your experience?',
    "formSubtitle" TEXT NOT NULL DEFAULT 'Your feedback helps others',
    "submitButtonText" TEXT NOT NULL DEFAULT 'Submit review',
    "successMessageTitle" TEXT NOT NULL DEFAULT 'Review submitted!',
    "successButtonText" TEXT NOT NULL DEFAULT 'Continue Shopping',
    "successMessage" TEXT NOT NULL DEFAULT 'Thank you for your review. It has been submitted successfully.',
    "starColor" TEXT DEFAULT '#f59e0b',
    "buttonBackgroundColor" TEXT DEFAULT '#1D9E75',
    "buttonTextColor" TEXT DEFAULT '#fff',
    "verifiedBadgeColor" TEXT DEFAULT '#1D9E75',
    "barFileColor" TEXT DEFAULT '#34C759',
    "borderRadius" TEXT NOT NULL DEFAULT '15px',
    "isShowReviewerName" BOOLEAN NOT NULL DEFAULT true,
    "isShowMediaThumbnails" BOOLEAN NOT NULL DEFAULT true,
    "isShowProductName" BOOLEAN NOT NULL DEFAULT true,
    "isShowVerifiedBadge" BOOLEAN NOT NULL DEFAULT true,
    "isShowReviewDate" BOOLEAN NOT NULL DEFAULT true,
    "isShowStarRatingOnCard" BOOLEAN NOT NULL DEFAULT true,
    "isShowHelpfulButton" BOOLEAN NOT NULL DEFAULT true,
    "isShowStarDistribution" BOOLEAN NOT NULL DEFAULT true,
    "isShowMediaStrip" BOOLEAN NOT NULL DEFAULT true,
    "isShowReviewCount" BOOLEAN NOT NULL DEFAULT true,
    "isShowRatingBarWithoutRating" BOOLEAN NOT NULL DEFAULT true,
    "isShowMediaWithoutRating" BOOLEAN NOT NULL DEFAULT true,
    "writeReviewButtonText" TEXT NOT NULL DEFAULT 'Write a review',
    "showHelfullButton" BOOLEAN NOT NULL DEFAULT true,
    "filterAndSorting" TEXT NOT NULL DEFAULT 'FILTER_AND_SORT',
    "reviewPerPage" INTEGER NOT NULL DEFAULT 10,
    "defaultSort" TEXT NOT NULL DEFAULT 'MOST_RECENT',
    "filterMinStar" "FilterMinStars" NOT NULL DEFAULT 'ALL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuickReviewWidget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteLoopWidget" (
    "id" UUID NOT NULL,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "advanceCss" TEXT NOT NULL DEFAULT '',
    "autoSlider" BOOLEAN NOT NULL DEFAULT false,
    "cardBackgroundColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "eyebrowLabel" TEXT NOT NULL DEFAULT 'CUSTOMER REVIEWS',
    "filterSorting" TEXT NOT NULL DEFAULT 'Filter & sorting both',
    "fiteringMinStart" TEXT NOT NULL DEFAULT '3 star and above',
    "headerStyle" TEXT NOT NULL DEFAULT 'center',
    "heading" TEXT NOT NULL DEFAULT 'Reviews from people',
    "quoteFontSize" INTEGER NOT NULL DEFAULT 24,
    "quoteMarkColor" TEXT NOT NULL DEFAULT '#1D9E75',
    "reviewStats" TEXT NOT NULL DEFAULT 'Show review count & verified badge',
    "showAppreciationOption" BOOLEAN NOT NULL DEFAULT true,
    "showArrowControls" BOOLEAN NOT NULL DEFAULT true,
    "showHeader" BOOLEAN NOT NULL DEFAULT true,
    "showMediaAsset" BOOLEAN NOT NULL DEFAULT true,
    "showProductName" BOOLEAN NOT NULL DEFAULT true,
    "showQuoteMarkIcon" BOOLEAN NOT NULL DEFAULT true,
    "showReviewerName" BOOLEAN NOT NULL DEFAULT true,
    "showStarDistribution" BOOLEAN NOT NULL DEFAULT true,
    "showVerifiedBadge" BOOLEAN NOT NULL DEFAULT true,
    "speed" INTEGER NOT NULL DEFAULT 450,
    "starColor" TEXT NOT NULL DEFAULT '#F59E0B',
    "subheading" TEXT NOT NULL DEFAULT 'Watch and hear what our customers have to say.',
    "textColor" TEXT NOT NULL DEFAULT '#303030',
    "textLength" INTEGER NOT NULL DEFAULT 160,
    "quoteLoopWidgetSettings" JSONB DEFAULT '{}',

    CONSTRAINT "QuoteLoopWidget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoStackSettings" (
    "id" UUID NOT NULL,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "showHeader" BOOLEAN NOT NULL DEFAULT true,
    "headerStyle" TEXT NOT NULL DEFAULT 'center',
    "eyebrowLabel" TEXT NOT NULL DEFAULT 'CUSTOMER REVIEWS',
    "heading" TEXT NOT NULL DEFAULT 'Reviews from people',
    "subheading" TEXT NOT NULL DEFAULT 'Watch and hear what our customers have to say.',
    "reviewStats" TEXT NOT NULL DEFAULT 'Show review count & verified badge',
    "showStarDistribution" BOOLEAN NOT NULL DEFAULT true,
    "showReviewerName" BOOLEAN NOT NULL DEFAULT true,
    "showReviewTextBelow" BOOLEAN NOT NULL DEFAULT true,
    "showVerifiedBadge" BOOLEAN NOT NULL DEFAULT true,
    "showVideoDuration" BOOLEAN NOT NULL DEFAULT true,
    "showProductName" BOOLEAN NOT NULL DEFAULT true,
    "showLoopVideo" BOOLEAN NOT NULL DEFAULT true,
    "mutedByDefault" BOOLEAN NOT NULL DEFAULT true,
    "autoplayOnHover" BOOLEAN NOT NULL DEFAULT true,
    "showNavigationDots" BOOLEAN NOT NULL DEFAULT true,
    "showArrowControls" BOOLEAN NOT NULL DEFAULT true,
    "thumbnailsShown" INTEGER NOT NULL DEFAULT 5,
    "fiteringMinStart" TEXT NOT NULL DEFAULT '3 star and above',
    "startColor" TEXT NOT NULL DEFAULT '#F59E0B',
    "activeDotColor" TEXT NOT NULL DEFAULT '#34C759',
    "badgeColor" TEXT NOT NULL DEFAULT '#34C759',
    "overlayTintColor" TEXT NOT NULL DEFAULT '#1A1A1A',
    "advanceCss" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "VideoStackSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewReelSettings" (
    "id" UUID NOT NULL,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "showHeader" BOOLEAN NOT NULL DEFAULT true,
    "headerStyle" TEXT NOT NULL DEFAULT 'center',
    "eyebrowLabel" TEXT NOT NULL DEFAULT 'CUSTOMER REVIEWS',
    "heading" TEXT NOT NULL DEFAULT 'Real reviews from real people',
    "subheading" TEXT NOT NULL DEFAULT 'Watch and hear what our customers have to say.',
    "reviewStats" TEXT NOT NULL DEFAULT 'Show review count & verified badge',
    "showReviewerName" BOOLEAN NOT NULL DEFAULT true,
    "showReviewImage" BOOLEAN NOT NULL DEFAULT true,
    "showVerifiedBadge" BOOLEAN NOT NULL DEFAULT true,
    "showProductName" BOOLEAN NOT NULL DEFAULT true,
    "showReviewDate" BOOLEAN NOT NULL DEFAULT true,
    "showAutoPlay" BOOLEAN NOT NULL DEFAULT true,
    "showNavigationDots" BOOLEAN NOT NULL DEFAULT true,
    "showArrowControls" BOOLEAN NOT NULL DEFAULT true,
    "autoplaySpeed" INTEGER NOT NULL DEFAULT 4,
    "cardsVisible" INTEGER NOT NULL DEFAULT 3,
    "fiteringMinStart" TEXT NOT NULL DEFAULT '3 star and above',
    "startColor" TEXT NOT NULL DEFAULT '#34C759',
    "activeDotColor" TEXT NOT NULL DEFAULT '#34C759',
    "cardBackgorud" TEXT NOT NULL DEFAULT '#FFF',
    "cardTextColor" TEXT NOT NULL DEFAULT '#000',
    "advanceCss" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "ReviewReelSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewHubWidget" (
    "id" UUID NOT NULL,
    "storeId" TEXT NOT NULL,
    "showHeader" BOOLEAN NOT NULL DEFAULT true,
    "headerStyle" TEXT NOT NULL DEFAULT 'center',
    "eyebrowLabel" TEXT NOT NULL DEFAULT 'CUSTOMER REVIEWS',
    "heading" TEXT NOT NULL DEFAULT 'Reviews from people',
    "subheading" TEXT NOT NULL DEFAULT 'Watch and hear what our customers have to say.',
    "reviewStats" TEXT NOT NULL DEFAULT 'Show review count & verified badge',
    "showStarDistribution" BOOLEAN NOT NULL DEFAULT true,
    "showReviewerName" BOOLEAN NOT NULL DEFAULT true,
    "showReviewTimer" BOOLEAN NOT NULL DEFAULT true,
    "showVerifiedBadge" BOOLEAN NOT NULL DEFAULT true,
    "showMediaAsset" BOOLEAN NOT NULL DEFAULT true,
    "showShareOption" BOOLEAN NOT NULL DEFAULT true,
    "showAppreciationOption" BOOLEAN NOT NULL DEFAULT true,
    "layout" TEXT NOT NULL DEFAULT '3',
    "filterSorting" TEXT NOT NULL DEFAULT 'FILTER_AND_SORTING',
    "reviewsPerPage" INTEGER NOT NULL DEFAULT 9,
    "starColor" TEXT NOT NULL DEFAULT '#34C759',
    "textColor" TEXT NOT NULL DEFAULT '#1A1A1A',
    "verifiedBadgeColor" TEXT NOT NULL DEFAULT '#1D9E75',
    "cardBackgroundColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "borderColor" TEXT NOT NULL DEFAULT '#F0F0F0',
    "filterChipColor" TEXT NOT NULL DEFAULT '#108848',
    "filterChipStarColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "advanceCss" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewHubWidget_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "Order_storeId_orderId_key" ON "Order"("storeId", "orderId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderLineItem_orderId_productId_key" ON "OrderLineItem"("orderId", "productId");

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
CREATE UNIQUE INDEX "Review_storeId_productId_reviewerEmail_key" ON "Review"("storeId", "productId", "reviewerEmail");

-- CreateIndex
CREATE UNIQUE INDEX "HelpfulCount_reviewId_customerEmail_key" ON "HelpfulCount"("reviewId", "customerEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Reply_reviewId_key" ON "Reply"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "StoreSettings_storeId_key" ON "StoreSettings"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "RequestScheduling_storeSettingsId_key" ON "RequestScheduling"("storeSettingsId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailSettings_storeSettingsId_key" ON "EmailSettings"("storeSettingsId");

-- CreateIndex
CREATE UNIQUE INDEX "PublishingModeration_storeSettingsId_key" ON "PublishingModeration"("storeSettingsId");

-- CreateIndex
CREATE UNIQUE INDEX "WidgetsSettings_storeSettingsId_key" ON "WidgetsSettings"("storeSettingsId");

-- CreateIndex
CREATE UNIQUE INDEX "BrandingSettings_storeSettingsId_key" ON "BrandingSettings"("storeSettingsId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminNotification_storeSettingsId_key" ON "AdminNotification"("storeSettingsId");

-- CreateIndex
CREATE UNIQUE INDEX "TrustBarWidget_storeId_key" ON "TrustBarWidget"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "QuickReviewWidget_storeId_key" ON "QuickReviewWidget"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteLoopWidget_storeId_key" ON "QuoteLoopWidget"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoStackSettings_storeId_key" ON "VideoStackSettings"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewReelSettings_storeId_key" ON "ReviewReelSettings"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewHubWidget_storeId_key" ON "ReviewHubWidget"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Store_storeGID_key" ON "Store"("storeGID");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_storeId_key" ON "Subscription"("storeId");

-- CreateIndex
CREATE INDEX "Subscription_plan_idx" ON "Subscription"("plan");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeGID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLineItem" ADD CONSTRAINT "OrderLineItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeGID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpfulCount" ADD CONSTRAINT "HelpfulCount_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reply" ADD CONSTRAINT "Reply_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "TrustBarWidget" ADD CONSTRAINT "TrustBarWidget_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeGID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuickReviewWidget" ADD CONSTRAINT "QuickReviewWidget_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeGID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteLoopWidget" ADD CONSTRAINT "QuoteLoopWidget_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeGID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoStackSettings" ADD CONSTRAINT "VideoStackSettings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeGID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewReelSettings" ADD CONSTRAINT "ReviewReelSettings_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeGID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewHubWidget" ADD CONSTRAINT "ReviewHubWidget_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeGID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("storeGID") ON DELETE CASCADE ON UPDATE CASCADE;
