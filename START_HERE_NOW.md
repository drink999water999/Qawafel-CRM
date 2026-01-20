# START HERE - Fix Your Issues Now

## You Have 2 Issues:

### 1. Local: Google login shows big number error ❌
### 2. Production (Vercel): "Server error" ❌

---

## FIX LOCAL GOOGLE LOGIN (2 minutes):

```bash
# Run this ONE command:
npx prisma migrate reset --force && npx prisma generate && npx prisma db seed && npm run dev
```

**What this does:**
- Resets database (fixes ID type)
- Recreates admin user
- Restarts server

**Then:**
- Go to http://localhost:3000/login
- Click "Sign in with Google"
- Should work now! ✅

**Note:** This will delete any users you created. Admin user will be recreated.

---

## FIX VERCEL PRODUCTION (5 minutes):

### Step 1: Vercel Environment Variables

Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

Add these 5 variables:

```
DATABASE_URL
(your production database - must be accessible from internet)

NEXTAUTH_URL
https://your-app-name.vercel.app

NEXTAUTH_SECRET
(generate with: openssl rand -base64 32)

GOOGLE_CLIENT_ID
(your Google client ID)

GOOGLE_CLIENT_SECRET
(your Google client secret)
```

### Step 2: Google Console

Go to: https://console.cloud.google.com/ → Your OAuth Client

Add this redirect URI:
```
https://your-app-name.vercel.app/api/auth/callback/google
```

Click **SAVE**

### Step 3: Setup Production Database

```bash
# Set production database
export DATABASE_URL="your_production_database_url"

# Push schema
npx prisma db push

# Create admin user
npx prisma db seed
```

### Step 4: Redeploy

```bash
git add .
git commit -m "Fix environment and schema"
git push
```

**Then:**
- Go to https://your-app-name.vercel.app/login
- Try logging in
- Should work now! ✅

---

## Quick Test:

### Local:
http://localhost:3000/api/test-db (should show admin user)

### Production:
https://your-app-name.vercel.app/api/test-db (should show admin user)

If test-db shows error, database isn't set up correctly.

---

## That's It!

Just run those commands and both issues will be fixed.

**Need detailed help?** See FIX_BOTH_ISSUES.md
