-- AlterTable
ALTER TABLE "QuoteLoopWidget" ADD COLUMN     "quoteLoopWidgetSettings" JSONB DEFAULT '{}';

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "productImage" TEXT;
