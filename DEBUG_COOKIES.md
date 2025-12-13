# 🔧 How to Debug Cookie Issue

## Check if Cookies Are Being Set

After you login, look at your terminal logs. You should see:

```
✅ Login successful, redirecting to dashboard
```

Then immediately after, check for middleware logs:

```
🔍 Middleware auth check: { path: '/dashboard', hasCookie: true, ... }
✅ Token verified successfully
🌐 Middleware: /dashboard | Auth: true
✅ Authenticated, allowing access to dashboard
```

## If You See This Instead:

```
🔍 Middleware auth check: { path: '/dashboard', hasCookie: false, ... }
❌ No access token found
🌐 Middleware: /dashboard | Auth: false
🚫 Not authenticated, redirecting to login
```

**This means cookies aren't being set!**

---

## Quick Test Steps

1. **Clear all cookies first:**
   - Open DevTools (F12)
   - Application → Cookies → `http://localhost:3000`
   - Right-click → Clear
   - Close browser completely
   - Reopen

2. **Login and watch terminal:**
   - Enter email + password
   - Submit
   - **Watch the terminal logs carefully**
   - Look for cookie presence in middleware logs

3. **Check browser cookies:**
   - After "successful" login
   - DevTools → Application → Cookies
   - Do you see `accessToken` and `refreshToken`?

---

## Expected Flow:

```
1. Submit login form
   → 🔐 Login attempt
   → 📊 Login result: success
   → ✅ Login successful

2. Cookies are set (in Server Action)
   → accessToken (15min)
   → refreshToken (7 days)

3. Redirect to /dashboard
   → POST /login 303

4. Middleware checks /dashboard
   → 🔍 Middleware auth check: hasCookie: true
   → ✅ Token verified
   → ✅ Authenticated, allowing access

5. Dashboard loads
   → GET /dashboard 200
```

---

## Run These Tests

### Test 1: Are cookies visible in browser?
After login, check DevTools → Application → Cookies

### Test 2: What does terminal say?
Look for the middleware logs with cookie info

### Test 3: Manual cookie test
Try setting a cookie manually in browser console:
```js
document.cookie = "test=value; path=/"
```
Can you see it in DevTools?

---

**Please run these tests and tell me:**
1. Do you see cookies in DevTools after login?
2. What do the middleware logs say (hasCookie: true or false)?
3. Are you testing on localhost:3000 or a different URL?
