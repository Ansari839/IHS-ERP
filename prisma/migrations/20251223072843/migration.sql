-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstLogin" BOOLEAN NOT NULL DEFAULT true,
    "forcePasswordChange" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "departmentId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "resourceId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserWarehouse" (
    "userId" INTEGER NOT NULL,
    "warehouseId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserWarehouse_pkey" PRIMARY KEY ("userId","warehouseId")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "unitType" TEXT NOT NULL,
    "isBase" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitConversion" (
    "id" SERIAL NOT NULL,
    "fromUnitId" INTEGER NOT NULL,
    "toUnitId" INTEGER NOT NULL,
    "conversionRate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitConversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "legalName" TEXT NOT NULL,
    "tradeName" TEXT,
    "address" TEXT,
    "country" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "taxId" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FiscalYear" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FiscalYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "isBase" BOOLEAN NOT NULL DEFAULT false,
    "exchangeRate" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" SERIAL NOT NULL,
    "quantityDecimals" INTEGER NOT NULL DEFAULT 2,
    "amountDecimals" INTEGER NOT NULL DEFAULT 2,
    "rateDecimals" INTEGER NOT NULL DEFAULT 4,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_action_resource_key" ON "Permission"("action", "resource");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_name_key" ON "Warehouse"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_name_key" ON "Unit"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_symbol_key" ON "Unit"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "UnitConversion_fromUnitId_toUnitId_key" ON "UnitConversion"("fromUnitId", "toUnitId");

-- CreateIndex
CREATE UNIQUE INDEX "FiscalYear_name_key" ON "FiscalYear"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_code_key" ON "Currency"("code");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWarehouse" ADD CONSTRAINT "UserWarehouse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWarehouse" ADD CONSTRAINT "UserWarehouse_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitConversion" ADD CONSTRAINT "UnitConversion_fromUnitId_fkey" FOREIGN KEY ("fromUnitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitConversion" ADD CONSTRAINT "UnitConversion_toUnitId_fkey" FOREIGN KEY ("toUnitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
