-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstLogin" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "forcePasswordChange" BOOLEAN NOT NULL DEFAULT true;
