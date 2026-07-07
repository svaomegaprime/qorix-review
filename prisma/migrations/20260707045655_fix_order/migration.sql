/*
  Warnings:

  - The values [PANDING] on the enum `ReviewCheckStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('AUTOMATIC', 'MANUAL');

-- AlterEnum
BEGIN;
CREATE TYPE "ReviewCheckStatus_new" AS ENUM ('SENT', 'OPENED', 'PENDING', 'REVIEWED', 'FAILED');
ALTER TABLE "public"."Order" ALTER COLUMN "reviewCheckStatus" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "reviewCheckStatus" TYPE "ReviewCheckStatus_new" USING ("reviewCheckStatus"::text::"ReviewCheckStatus_new");
ALTER TYPE "ReviewCheckStatus" RENAME TO "ReviewCheckStatus_old";
ALTER TYPE "ReviewCheckStatus_new" RENAME TO "ReviewCheckStatus";
DROP TYPE "public"."ReviewCheckStatus_old";
ALTER TABLE "Order" ALTER COLUMN "reviewCheckStatus" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "requestType" "RequestType" NOT NULL DEFAULT 'AUTOMATIC',
ALTER COLUMN "reviewCheckStatus" SET DEFAULT 'PENDING';
