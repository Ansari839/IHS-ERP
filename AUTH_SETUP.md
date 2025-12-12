# Authentication System Documentation

Complete guide for the Next.js authentication engine with JWT tokens, refresh tokens, and Prisma integration.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [API Endpoints](#api-endpoints)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Testing with curl](#testing-with-curl)
6. [Client Integration](#client-integration)
7. [Security Best Practices](#security-best-practices)
8. [Migration Guide](#migration-guide)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install jsonwebtoken bcrypt
```

### 2. Configure Environment

Create `.env.local` with the following (see `.env.example` for template):

```bash
# Generate secrets:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env.local:
ACCESS_TOKEN_SECRET=<generated-secret-1>
REFRESH_TOKEN_SECRET=<generated-secret-2>
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
DATABASE_URL=postgresql://user:password@localhost:5432/erp_db
```

### 3. Run Database Migrations

```bash
npx prisma migrate dev --name add_auth_models
npx prisma generate
```

### 4. Start Development Server

```bash
npm run dev
```

---

## 🔌 API Endpoints

### POST /api/auth/login

Authenticate user and receive tokens.

**Request:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "test@example.com",
      "name": "Test User"
    }
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "error": {
    "message": "Invalid email or password"
  }
}
```

---

### POST /api/auth/refresh

Get a new access token using a refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### POST /api/auth/logout

Revoke a refresh token (logout).

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "message": "Logout successful"
  }
}
```

---

### GET /api/protected

Example protected route (requires authentication).

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "message": "This is protected data",
    "user": {
      "id": 1,
      "email": "test@example.com",
      "name": "Test User"
    },
    "timestamp": "2025-01-13T00:00:00.000Z"
  }
}
```

---

## 🧪 Testing with curl

### 1. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' | jq
```

**Save the tokens from the response:**
```bash
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
REFRESH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 2. Access Protected Route

```bash
curl http://localhost:3000/api/protected \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq
```

### 3. Refresh Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }" | jq
```

### 4. Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }" | jq
```

---

## 🗄️ Database Setup

### Prisma Models

The authentication system uses two models:

**User Model:**
```prisma
model User {
  id            Int            @id @default(autoincrement())
  email         String         @unique
  name          String?
  password      String         // Bcrypt-hashed
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  refreshTokens RefreshToken[]
}
```

**RefreshToken Model:**
```prisma
model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  isRevoked Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

### Create a Test User

Create a seed script or use Prisma Studio:

```javascript
// prisma/seed.js
const { PrismaClient } = require('./app/generated/prisma');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
    },
  });
  
  console.log('Created user:', user);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
```

Run the seed:
```bash
node prisma/seed.js
```

---

## 💻 Client Integration

### React/Next.js Example

#### 1. Create Auth Context

```typescript
// context/AuthContext.tsx
'use client';

import { createContext, useContext, useState } from 'react';

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (data.success) {
      setAccessToken(data.data.accessToken);
      setRefreshToken(data.data.refreshToken);
    }
  };

  const logout = async () => {
    if (refreshToken) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    }
    setAccessToken(null);
    setRefreshToken(null);
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) return;

    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();
    if (data.success) {
      setAccessToken(data.data.accessToken);
    }
  };

  return (
    <AuthContext.Provider value={{ accessToken, refreshToken, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext)!;
```

#### 2. Use in Components

```typescript
'use client';

import { useAuth } from '@/context/AuthContext';

export default function LoginForm() {
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await login(
      formData.get('email') as string,
      formData.get('password') as string
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Login</button>
    </form>
  );
}
```

#### 3. Fetch with Auto-Refresh

```typescript
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const { accessToken, refreshAccessToken } = useAuth();

  // Add auth header
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
  };

  let res = await fetch(url, { ...options, headers });

  // Token expired - refresh and retry
  if (res.status === 401) {
    await refreshAccessToken();
    const newToken = useAuth().accessToken;
    headers.Authorization = `Bearer ${newToken}`;
    res = await fetch(url, { ...options, headers });
  }

  return res;
}
```

---

## 🔒 Security Best Practices

### 1. HTTPS Only in Production

```javascript
// middleware.js
export function middleware(request) {
  if (process.env.NODE_ENV === 'production' && !request.url.startsWith('https://')) {
    return NextResponse.redirect(`https://${request.url.slice(7)}`);
  }
}
```

### 2. Secure Cookie Storage (Recommended)

Instead of sending refresh tokens in JSON, use httpOnly cookies:

```javascript
// In authController.js
export function setRefreshTokenCookie(res, refreshToken) {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}
```

### 3. Rate Limiting

```javascript
// middleware/rateLimit.js
const requests = new Map();

export function rateLimit(maxRequests = 5, windowMs = 60000) {
  return (req) => {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const userRequests = requests.get(ip) || [];
    
    const recentRequests = userRequests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return { limited: true };
    }
    
    recentRequests.push(now);
    requests.set(ip, recentRequests);
    return { limited: false };
  };
}
```

### 4. Token Rotation

Enable refresh token rotation in `authController.js`:

```javascript
// Uncomment the rotation code in the refresh() function
// This generates a new refresh token on each refresh
// and revokes the old one for enhanced security
```

---

## 🔄 Migration Guide

### From In-Memory to Production (Prisma)

The current implementation uses in-memory storage for demo purposes. Follow these steps for production:

1. **Run migrations:**
   ```bash
   npx prisma migrate dev --name add_auth_models
   ```

2. **In `controllers/authController.js`, uncomment all PRODUCTION CODE sections**

3. **Remove IN-MEMORY sections:**
   - Delete `DEMO_USER`
   - Delete `refreshTokenStore`

4. **Create seed user** (see Database Setup above)

5. **Test all endpoints** with the database

6. **Optional enhancements:**
   - Enable refresh token rotation
   - Add token cleanup cron job
   - Implement "Remember me" functionality
   - Add email verification

---

## 📚 Additional Resources

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## 🐛 Troubleshooting

**Token verification fails:**
- Check that secrets are properly configured
- Verify token hasn't expired
- Ensure using the correct secret for each token type

**Database connection fails:**
- Verify DATABASE_URL in .env
- Check PostgreSQL is running
- Run `npx prisma generate`

**CORS issues:**
- Configure Next.js for your frontend domain
- Set proper headers in API routes

---

**Questions?** Check the code comments or open an issue.
