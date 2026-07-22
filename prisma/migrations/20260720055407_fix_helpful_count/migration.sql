/*
  Warnings:

  - A unique constraint covering the columns `[reviewId,customerEmail]` on the table `HelpfulCount` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "HelpfulCount_reviewId_customerEmail_key" ON "HelpfulCount"("reviewId", "customerEmail");
