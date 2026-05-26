-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('STAFF', 'CORPORATE', 'INTERN', 'IT', 'STUDENT', 'OTHER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "userType" "UserType" NOT NULL DEFAULT 'STAFF';
ALTER TABLE "users" ADD COLUMN "displayPictureUrl" TEXT;
ALTER TABLE "users" ADD COLUMN "displayPictureKey" TEXT;
