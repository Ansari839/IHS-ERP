-- AlterTable
-- Add new columns with default values first
ALTER TABLE "User" ADD COLUMN "password" TEXT NOT NULL DEFAULT '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5.7gJ8qK9Y7xG';
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER';
ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Remove the default for password (it was only needed for migration)
ALTER TABLE "User" ALTER COLUMN "password" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP DEFAULT;
