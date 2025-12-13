# 🐛 Debugging Internal Server Error on Login

## Quick Checklist

### 1️⃣ Check Environment Variables

Make sure your `.env` file exists in the project root with:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
JWT_SECRET="your-secret-key-at-least-32-chars-long"
NODE_ENV="development"
```

**To verify:**
```bash
# In Git Bash or CMD
cat .env
# OR
type .env
```

---

### 2️⃣ Check Database Connection

Test if your database is accessible:

```bash
npx prisma studio
```

**If this fails:**
- ❌ Database is not running
- ❌ DATABASE_URL is incorrect
- ❌ Database doesn't exist

**Fix:**
- Start PostgreSQL service
- Check connection string
- Create database: `createdb your_database_name`

---

### 3️⃣ Check Database Tables Exist

Run:
```bash
npx prisma migrate dev --name init
```

This creates tables if they don't exist.

---

### 4️⃣ Check Database is Seeded

Run:
```bash
npx prisma db seed
```

Should output:
```
✅ Created Super Admin
✅ Created Test User
```

---

### 5️⃣ Check Server Logs

Look at your terminal where `npm run dev` is running.

**Common errors:**

#### Error: "connect ECONNREFUSED"
**Fix:** Database is not running
```bash
# Windows
net start postgresql-x64-14

# Or check PostgreSQL service in Services
```

#### Error: "Invalid `prisma.user.findUnique()`"
**Fix:** Database schema doesn't match
```bash
npx prisma migrate reset  # ⚠️ Deletes data!
npx prisma db seed
```

#### Error: "Environment variable not found: DATABASE_URL"
**Fix:** Create `.env` file:
```bash
# Create .env in project root
echo DATABASE_URL="postgresql://user:pass@localhost:5432/dbname" > .env
echo JWT_SECRET="your-secret-key-min-32-characters-long-for-security" >> .env
```

#### Error: "Invalid signature"
**Fix:** JWT_SECRET is missing
```bash
# Add to .env
JWT_SECRET="pick-a-random-secret-key-at-least-32-chars"
```

---

### 6️⃣ Enable Detailed Error Logging

I'll add this to your login action to see the exact error.

---

## Step-by-Step Fix

### Step 1: Create .env file (if missing)

Create `c:\Abdullah\IHS-ERP\.env` with:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ihs_erp"
JWT_SECRET="super-secret-jwt-key-change-this-in-production-min-32-chars"
NODE_ENV="development"
```

**Important:** Change `postgres`, `password`, and database name to match YOUR setup!

### Step 2: Create Database

```bash
# In psql or pgAdmin, run:
CREATE DATABASE ihs_erp;
```

Or use command line:
```bash
createdb ihs_erp
```

### Step 3: Run Migrations

```bash
npx prisma migrate dev --name init
```

### Step 4: Seed Database

```bash
npx prisma db seed
```

### Step 5: Restart Dev Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 6: Try Login Again

Visit: `http://localhost:3000/login`

**Credentials:**
- Email: `admin@erp.com`
- Password: `Admin@123`

---

## Common Issues & Solutions

### Issue: "Database does not exist"
```bash
createdb ihs_erp
# Then run migrations again
npx prisma migrate dev --name init
```

### Issue: "User table is empty"
```bash
npx prisma db seed
```

### Issue: "Password incorrect"
Make sure you're using:
- `Admin@123` (capital A, with @)
- NOT `admin123` or `Admin123`

### Issue: Still getting errors
**Check the server console** (terminal where npm run dev is running)

Copy the full error message and share it. Look for:
- `PrismaClientKnownRequestError`
- `Error:` messages
- Stack traces

---

## Need More Help?

Run these diagnostic commands and share the output:

```bash
# Check Prisma status
npx prisma validate

# Check database connection
npx prisma db pull

# View current data
npx prisma studio
```

---

## Expected Working Flow

When everything works:

1. Enter email + password
2. Server logs: `POST /login 200` ✅
3. Browser redirects to `/dashboard` ✅
4. No errors in console ✅

When something's wrong:

1. Enter email + password  
2. Server logs: `POST /login 500` ❌
3. Error message in browser ❌
4. Check server console for details

---

**What's the exact error in your server console?** Please share that so I can help fix it!
