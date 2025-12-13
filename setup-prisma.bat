@echo off
REM Prisma Setup Script
REM Run this to generate Prisma client and seed the database

echo ================================================
echo  Prisma Database Setup
echo ================================================
echo.

echo Step 1: Generating Prisma Client...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to generate Prisma client
    pause
    exit /b 1
)
echo ✓ Prisma Client generated successfully
echo.

echo Step 2: Running database migrations...
call npx prisma migrate dev --name init
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Migration may have failed or already exists
)
echo.

echo Step 3: Seeding database with test users...
call npx prisma db seed
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to seed database
    pause
    exit /b 1
)
echo.

echo ================================================
echo  Setup Complete!
echo ================================================
echo.
echo You can now login with:
echo.
echo  Admin Account:
echo    Email:    admin@erp.com
echo    Password: Admin@123
echo.
echo  Test Account:
echo    Email:    test@example.com
echo    Password: password123
echo.
echo ================================================
echo.
pause
