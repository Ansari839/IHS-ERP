# Login Page Testing Guide

## Quick Test Instructions

### Prerequisites
1. Enable PowerShell scripts (if not already done):
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

2. Ensure DATABASE_URL is configured in `.env.local`

3. Make sure you have at least one user in the database

---

## Test Scenarios

### ✅ Test 1: Login Flow (New User)

**Steps:**
1. Start dev server: `npm run dev`
2. Open browser: `http://localhost:3000`
3. **Expected:** Auto-redirect to `/login`
4. Enter credentials:
   - Email: `test@example.com`
   - Password: `password123`
5. Click "Sign In"
6. **Expected:** Redirect to `/dashboard`
7. **Expected:** See dashboard with real data

**Success Criteria:**
- ✅ Redirected from `/` to `/login`
- ✅ Login form appears
- ✅ After login, redirected to `/dashboard`
- ✅ Dashboard shows data

---

### ✅ Test 2: Already Logged In

**Steps:**
1. Complete Test 1 (be logged in)
2. Try to visit `/login` directly in address bar
3. **Expected:** Immediately redirected to `/dashboard`

**Success Criteria:**
- ✅ Can't access login page when authenticated
- ✅ Automatic redirect to dashboard

---

### ✅ Test 3: Protected Route Access

**Steps:**
1. Open browser in incognito/private mode
2. Go to `http://localhost:3000/dashboard`
3. **Expected:** Redirect to `/login?redirect=/dashboard`
4. Login with valid credentials
5. **Expected:** Redirect back to `/dashboard`

**Success Criteria:**
- ✅ Dashboard is protected
- ✅ Redirect parameter preserved
- ✅ After login, returns to intended page

---

### ✅ Test 4: Invalid Credentials

**Steps:**
1. Go to `/login`
2. Enter invalid credentials:
   - Email: `wrong@example.com`
   - Password: `wrongpassword`
3. Click "Sign In"
4. **Expected:** Red error message appears
5. **Expected:** Stay on login page

**Success Criteria:**
- ✅ Error message displayed
- ✅ No redirect
- ✅ Can try again

---

### ✅ Test 5: Validation Errors

**Steps:**
1. Go to `/login`
2. Leave fields empty, click "Sign In"
3. **Expected:** "Please fill in all fields" error
4. Enter invalid email: `notanemail`
5. **Expected:** "Please enter a valid email address" error
6. Enter short password (< 6 chars): `12345`
7. **Expected:** "Password must be at least 6 characters" error

**Success Criteria:**
- ✅ Client-side validation works
- ✅ Helpful error messages
- ✅ No unnecessary server calls

---

### ✅ Test 6: Logout Flow

**Steps:**
1. Login successfully (complete Test 1)
2. Click user avatar in header
3. Click "Logout" in dropdown
4. **Expected:** See loading spinner briefly
5. **Expected:** Redirect to `/`
6. **Expected:** Then redirect to `/login` (not authenticated)
7. Try to visit `/dashboard`
8. **Expected:** Redirect to `/login`

**Success Criteria:**
- ✅ Logout button works
- ✅ Cookies cleared
- ✅ Redirected to home/login
- ✅ Can't access dashboard anymore

---

### ✅ Test 7: Loading States

**Steps:**
1. Go to `/login`
2. Enter valid credentials
3. Click "Sign In"
4. **Expected:** Button shows "Signing in..." with spinner
5. **Expected:** Form inputs disabled during submission

**Success Criteria:**
- ✅ Loading state visible
- ✅ Button disabled during submit
- ✅ Visual feedback

---

## Expected File Structure

```
app/
├── page.tsx                    # Redirect logic
├── login/
│   ├── page.tsx               # Login form
│   └── layout.tsx             # Auth layout
├── dashboard/
│   ├── page.tsx               # Dashboard content
│   └── layout.tsx             # Dashboard layout
├── actions/
│   └── auth.ts                # Server Actions
└── api/
    └── auth/
        └── login/
            └── route.ts       # API endpoint (legacy)

middleware.ts                   # Edge authentication
components/
└── logout-button.tsx          # Logout component
```

---

## Common Issues & Solutions

### Issue: PowerShell execution error
**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: Database connection error
**Solution:** Check `.env.local` has valid `DATABASE_URL`

### Issue: "Module not found" error
**Solution:** Run `npm install`

### Issue: Infinite redirect loop
**Solution:** Clear cookies in browser DevTools → Application → Cookies

### Issue: Login always fails
**Solution:** Verify user exists in database:
```sql
SELECT * FROM "User" WHERE email = 'test@example.com';
```

---

## Browser DevTools Checks

### Console Tab
Should see no errors during normal flow

### Network Tab
- Login: POST to `/login` → 303 redirect
- Dashboard: GET `/dashboard` → 200 OK

### Application Tab → Cookies
After login should see:
- `accessToken` (httpOnly, secure in prod)
- `refreshToken` (httpOnly, secure in prod)

After logout:
- Both cookies should be deleted

---

## Quick Manual Test Checklist

- [ ] Visit `/` → redirects to `/login`
- [ ] Login with valid credentials → redirects to `/dashboard`
- [ ] Visit `/login` while logged in → redirects to `/dashboard`
- [ ] Visit `/dashboard` while logged out → redirects to `/login`
- [ ] Invalid credentials → shows error, stays on login
- [ ] Empty form → shows validation error
- [ ] Logout → clears cookies, redirects to `/`
- [ ] Loading states appear during login/logout

---

## Success Indicators

✅ **All tests pass**
✅ **No console errors**
✅ **Smooth redirects**
✅ **Cookies set/cleared properly**
✅ **UI responsive and accessible**

---

## Need Help?

If any test fails:
1. Check browser console for errors
2. Check terminal for server errors
3. Verify database connection
4. Clear browser cookies and try again
5. Check middleware.ts is in project root
