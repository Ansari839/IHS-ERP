# Quick Database Setup Commands

## The Issue
The database tables don't exist yet. The error `column 'password' does not exist` means tables need to be created.

## Solution - Run in Git Bash Terminal

Since you're using Git Bash, run these commands **in order**:

### Step 1: Create Database Tables
```bash
npx prisma migrate dev --name init
```

**What this does:**
- Creates all tables (User, Post, RefreshToken)
- Applies the schema to your PostgreSQL database

### Step 2: Seed the Database
```bash
npx prisma db seed
```

**What this creates:**
- Super Admin account
- Test User account

---

## Expected Output

### After Migration:
```
✔ Your database is now in sync with your Prisma schema.

✔ Generated Prisma Client (7.1.0) to ./app/generated/prisma in 95ms

Running seed command `tsx prisma/seed.ts` ...
```

### After Seeding:
```
🌱 Seeding database...

✅ Created Super Admin:
   ID: 1
   Email: admin@erp.com
   Name: Super Admin
   Role: SUPER_ADMIN

✅ Created Test User:
   ID: 2
   Email: test@example.com
   Name: Test User
   Role: USER

==================================================
📋 LOGIN CREDENTIALS
==================================================

🔐 Super Admin:
   Email:    admin@erp.com
   Password: Admin@123

👤 Test User:
   Email:    test@example.com
   Password: password123
```

---

## Alternative: Use Command Prompt (Not Git Bash)

If Git Bash doesn't work, open **Command Prompt** and run:

```cmd
npx prisma migrate dev --name init
npx prisma db seed
```

---

## Verify Success

Check if tables were created:
```bash
npx prisma studio
```

This opens a GUI where you can see your database tables and data.

---

## Login Credentials (After Seeding)

🔐 **Admin:** admin@erp.com / Admin@123  
👤 **Test:** test@example.com / password123

---

**Next:** Run `npm run dev` and test the login!
