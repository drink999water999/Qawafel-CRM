# 🔍 DIAGNOSE LOGIN ISSUES

## Run This Command First:

```bash
npm run test:db
```

This will tell you EXACTLY what's wrong.

---

## Issue 1: Credentials Login Not Working

### Check Your Terminal Output

When you click "Login", you should see detailed logs like this:

**If you see:**
```
❌ USER NOT FOUND in database

🔧 TO FIX: Run these commands:
   1. npx prisma db push
   2. npx prisma db seed
   3. npm run test:db
```

**Then run those commands!**

---

**If you see:**
```
✅ User found in database!
❌ PASSWORD INCORRECT
   Expected password: admin
   Provided password: [what you typed]
```

**Then you're typing the wrong password. Use exactly:** `admin`

---

**If you see NO LOGS AT ALL:**

The server isn't running or there's a JavaScript error.

**Fix:**
```bash
# Clear cache
rm -rf .next

# Restart server
npm run dev

# Check browser console for errors (Press F12)
```

---

## Issue 2: Google OAuth Error

### The Error You're Seeing:

```
The OAuth client was not found.
Error 401: invalid_client
```

### Why This Happens:

Google OAuth is NOT configured. You have two options:

### Option A: Ignore Google (Recommended)

**Just use email/password login.**

- Works perfectly without Google
- No setup needed
- Ignore the Google button

### Option B: Setup Google OAuth

**1. Get Credentials from Google:**

1. Go to: https://console.cloud.google.com/
2. Create a project
3. Go to "APIs & Services" → "Credentials"
4. Create "OAuth 2.0 Client ID"
5. Add authorized redirect URI:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. Copy Client ID and Client Secret

**2. Add to .env.local:**

```env
GOOGLE_CLIENT_ID="your-actual-client-id-here"
GOOGLE_CLIENT_SECRET="your-actual-secret-here"
```

**3. Restart:**

```bash
rm -rf .next
npm run dev
```

---

## Complete Diagnosis Steps:

### Step 1: Check Environment

```bash
# Make sure this file exists
ls .env.local

# Should show: .env.local
```

**If file doesn't exist:**
```bash
cp .env.example .env.local
```

Then edit it with your database connection.

### Step 2: Check Database

```bash
npm run test:db
```

**Look for:**
- ✅ Database connection successful
- ✅ Users table exists
- ✅ Admin user found
- ✅ Admin user approved

**If you see ❌:**
```bash
npx prisma db push
npx prisma db seed
npm run test:db
```

### Step 3: Try Login

```bash
# Make sure server is running
npm run dev
```

Go to: http://localhost:3000/login

**Email:** `mohamed.hussein@qawafel.sa`  
**Password:** `admin`

### Step 4: Check Terminal

After clicking "Login", your terminal should show:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 CREDENTIALS LOGIN ATTEMPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Login attempt for email: mohamed.hussein@qawafel.sa
🔍 Searching database...
✅ User found in database!
   Email: mohamed.hussein@qawafel.sa
   Has password: true
   Approved: true
   Role: admin
   Provider: credentials
🔑 Checking password...
✅ Password correct!
✅ User is approved!
✅ LOGIN SUCCESSFUL!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Common Problems & Solutions:

### Problem: "❌ USER NOT FOUND"

**Solution:**
```bash
npx prisma db seed
```

### Problem: "❌ PASSWORD INCORRECT"

**Solution:** Make sure you're typing exactly: `admin` (lowercase)

### Problem: "💥 DATABASE ERROR"

**Solution:**
1. Check DATABASE_URL in .env.local
2. Make sure PostgreSQL/MySQL is running
3. Run: `npx prisma db push`

### Problem: "Google OAuth client not found"

**Solution:**
- **Easy:** Just use email/password login (ignore Google)
- **Advanced:** Set up Google OAuth (see Option B above)

### Problem: No terminal logs

**Solution:**
```bash
rm -rf .next
npm run dev
```

Check browser console (F12) for JavaScript errors

---

## Quick Fix Script:

Run all these commands:

```bash
# 1. Make sure env file exists
cp .env.example .env.local

# 2. Edit .env.local and add your DATABASE_URL

# 3. Setup database
npx prisma generate
npx prisma db push
npx prisma db seed

# 4. Test
npm run test:db

# 5. Start
rm -rf .next
npm run dev
```

Then try logging in at: http://localhost:3000/login

---

## What to Share if Still Not Working:

1. **Output of:**
```bash
npm run test:db
```

2. **Terminal output when you click "Login"**
   (Copy the whole block between the ━━━━ lines)

3. **Your .env.local file** (hide passwords):
```env
DATABASE_URL="postgresql://localhost/..."  # ← show format, hide password
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."  # ← hide this
```

4. **Browser console errors** (Press F12, check Console tab)

With these 4 things, we can diagnose any issue!
