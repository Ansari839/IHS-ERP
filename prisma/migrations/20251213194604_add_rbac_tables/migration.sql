/*
  Warnings:

  - You are about to drop the column `module` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `isSystem` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Role` table. All the data in the column will be lost.
  - The primary key for the `RolePermission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `RolePermission` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `RolePermission` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[action,resource]` on the table `Permission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `resource` to the `Permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roleId_fkey";

-- DropIndex
DROP INDEX "Permission_name_key";

-- DropIndex
DROP INDEX "Permission_slug_key";

-- DropIndex
DROP INDEX "Role_slug_key";

-- DropIndex
DROP INDEX "RolePermission_permissionId_idx";

-- DropIndex
DROP INDEX "RolePermission_roleId_idx";

-- DropIndex
DROP INDEX "RolePermission_roleId_permissionId_key";

-- DropIndex
DROP INDEX "User_roleId_idx";

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "module",
DROP COLUMN "name",
DROP COLUMN "slug",
ADD COLUMN     "resource" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "isSystem",
DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "id",
ADD COLUMN     "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId", "permissionId");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "roleId",
DROP COLUMN "status",
ADD COLUMN     "departmentId" INTEGER;

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_action_resource_key" ON "Permission"("action", "resource");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
