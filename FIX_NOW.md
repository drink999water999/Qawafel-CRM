# 🚨 FIX LOGIN RIGHT NOW

## Step 1: Run This Command

```bash
npm run test:db
```

**This will show you EXACTLY what's wrong.**

Look at the output and find what's ❌

---

## Step 2: Fix Based on What You See

### If you see: ❌ Database connection failed

**Your database isn't running or DATABASE_URL is wrong.**

**Fix:**
1. Make sure PostgreSQL/MySQL is running
2. Check .env.local file has correct DATABASE_URL
3. Format should be: `postgresql://user:password@localhost:5432/database`

---

### If you see: ❌ Users table not found

**Your database schema isn't set up.**

**Fix:**
```bash
npx prisma db push
npm run test:db
```

---

### If you see: ❌ Admin user NOT found

**The admin user doesn't exist.**

**Fix:**
```bash
npx prisma db seed
npm run test:db
```

---

### If you see: ❌ Admin user is not approved

**The admin user exists but isn't approved.**

**Fix:**
```bash
npx prisma db seed
npm run test:db
```

---

### If you see: ❌ Admin user has no password

**The user exists but has no password set.**

**Fix:**
```bash
npx prisma db seed
npm run test:db
```

---

### If everything shows ✅

**Then try logging in!**

```bash
npm run dev
```

Go to: http://localhost:3000/login

**Email:** `mohamed.hussein@qawafel.sa`  
**Password:** `admin`

---

## About Google OAuth Error

The error you're seeing:
```
The OAuth client was not found.
Error 401: invalid_client
```

**This means Google OAuth is not configured.**

### You have 2 choices:

**Option 1: Just Use Email/Password (Recommended)**
- Works perfectly
- No Google setup needed
- Ignore the Google button

**Option 2: Set Up Google OAuth**
1. Go to https://console.cloud.google.com/
2. Create OAuth credentials
3. Add to .env.local:
   ```env
   GOOGLE_CLIENT_ID="your-id"
   GOOGLE_CLIENT_SECRET="your-secret"
   ```
4. Restart: `npm run dev`

---

## Full Reset (If Nothing Works)

```bash
# 1. Make sure .env.local exists
cp .env.example .env.local

# 2. Edit .env.local - set your DATABASE_URL

# 3. Reset everything
rm -rf .next
npx prisma generate
npx prisma db push
npx prisma db seed

# 4. Test
npm run test:db

# 5. Start
npm run dev
```

---

## What You Should See When It Works

### Terminal when you login:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 CREDENTIALS LOGIN ATTEMPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Login attempt for email: mohamed.hussein@qawafel.sa
🔍 Searching database...
✅ User found in database!
🔑 Checking password...
✅ Password correct!
✅ User is approved!
✅ LOGIN SUCCESSFUL!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Browser:
- Redirects to dashboard
- Shows your name in top right

---

## Share This If Still Not Working

Run these and share the output:

```bash
# 1. Database test
npm run test:db

# 2. Try to login and copy the terminal output

# 3. Show your .env.local (hide passwords):
# DATABASE_URL="postgresql://localhost/..."
# NEXTAUTH_URL="http://localhost:3000"
# NEXTAUTH_SECRET="..."
```

With this info, we can diagnose any issue!

---

## TL;DR - Just Run These:

```bash
npm run test:db
```

Look for ❌ and fix them, then:

```bash
npm run dev
```

Login at http://localhost:3000/login with:
- Email: `mohamed.hussein@qawafel.sa`
- Password: `admin`
