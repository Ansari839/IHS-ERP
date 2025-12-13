# Prisma Setup Guide

## Issue: Prisma Client Not Generated

The error `Cannot find module '.prisma/client/default'` means the Prisma client needs to be generated.

## Solution

### Step 1: Enable PowerShell Scripts (One-time)

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Step 2: Generate Prisma Client

```powershell
npx prisma generate
```

**Expected Output:**
```
✔ Generated Prisma Client (5.x.x) to ./app/generated/prisma
```

### Step 3: Run Database Migration (if needed)

```powershell
npx prisma migrate dev --name init
```

### Step 4: Seed the Database

```powershell
npx prisma db seed
```

## What Gets Created

After running these commands, you'll have:

### Database Tables:
- ✅ `User` - User accounts
- ✅ `Post` - Posts/content
- ✅ `RefreshToken` - Authentication tokens

### Test Users:
```
🔐 Super Admin
   Email:    admin@erp.com
   Password: Admin@123

👤 Test User
   Email:    test@example.com  
   Password: password123
```

## Quick Reference

### Check Prisma Status
```powershell
npx prisma studio
```
Opens a GUI to view/edit your database.

### View Database
```powershell
npx prisma studio
```

### Reset Database (⚠️ Deletes all data)
```powershell
npx prisma migrate reset
```

## Common Issues

### Issue: PowerShell execution policy
**Fix:** Run Step 1 above

### Issue: Database connection failed
**Fix:** Check `.env` file has valid `DATABASE_URL`

### Issue: Module not found
**Fix:** Run `npx prisma generate` again

## Environment Variables Required

Create `.env` file in project root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-secret-key-change-in-production"
NODE_ENV="development"
```

## Login Credentials After Seeding

Use these credentials to test the login page:

**Admin Account:**
- Email: `admin@erp.com`
- Password: `Admin@123`

**Test Account:**
- Email: `test@example.com`
- Password: `password123`

---

**Ready to use after completing all steps!**
