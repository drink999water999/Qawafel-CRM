# FIX BOTH ISSUES - Local Google + Vercel Production

## Issue 1: Local Google Login Error

**Error:** `Unable to fit value 112099103475751780000 into a 64-bit signed integer`

**Cause:** Google IDs are too large for integer fields

**Fix:**

```bash
# 1. Reset database (will lose existing users)
npx prisma migrate reset --force

# 2. Regenerate Prisma
npx prisma generate

# 3. Seed admin user
npx prisma db seed

# 4. Restart
rm -rf .next
npm run dev

# 5. Test Google login - should work now!
```

**What changed:** User.id changed from `Int` to `String` to handle Google's large IDs.

---

## Issue 2: Vercel Production "Server error"

**Error:** `Server error - Check the server logs`

**Cause:** Missing or incorrect environment variables

**Fix:**

### A. Set Environment Variables in Vercel:

Go to Vercel → Settings → Environment Variables

Add these:

```
DATABASE_URL = your_production_database_url
NEXTAUTH_URL = https://your-domain.vercel.app
NEXTAUTH_SECRET = (generate with: openssl rand -base64 32)
GOOGLE_CLIENT_ID = your_google_client_id
GOOGLE_CLIENT_SECRET = your_google_client_secret
```

### B. Update Google Console:

Add this redirect URI:

```
https://your-domain.vercel.app/api/auth/callback/google
```

### C. Setup Production Database:

```bash
# Use production DATABASE_URL
export DATABASE_URL="your_production_url"

# Push schema
npx prisma db push

# Seed admin user
npx prisma db seed
```

### D. Redeploy Vercel:

```bash
git commit --allow-empty -m "Fix environment variables"
git push
```

---

## Quick Commands:

### For Local (Fix Google):

```bash
npx prisma migrate reset --force && npx prisma generate && npx prisma db seed && npm run dev
```

### For Vercel (After setting env vars):

```bash
# Connect to production DB
export DATABASE_URL="your_production_url"

# Setup database
npx prisma db push && npx prisma db seed

# Trigger redeploy
git push
```

---

## Verification:

### Local:
1. http://localhost:3000/login
2. Try Google login ✅
3. Try email/password login ✅

### Production:
1. https://your-domain.vercel.app/api/test-db (should show user data)
2. https://your-domain.vercel.app/login
3. Try both logins ✅

---

## Need More Help?

- **Local Google Error:** See MIGRATE_DATABASE.md
- **Google Redirect Error:** See FIX_GOOGLE_OAUTH.md
- **Vercel Issues:** See VERCEL_SETUP.md

---

## Summary:

**Local Issue:** Database migration needed (User ID Int → String)
**Production Issue:** Environment variables + Google redirect URI

Both are fixable in 5 minutes following the steps above!
