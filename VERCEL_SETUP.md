# VERCEL DEPLOYMENT - Fix Production Errors

## The "Server error" on Vercel means environment variables are missing or incorrect.

---

## Step 1: Set Environment Variables in Vercel

Go to your Vercel project dashboard:

1. Click **Settings**
2. Click **Environment Variables**
3. Add these variables:

### Required Variables:

```
DATABASE_URL
Value: Your production database URL
Example: postgresql://user:password@host:5432/database

NEXTAUTH_URL
Value: https://your-domain.vercel.app
Important: Use HTTPS and your actual Vercel domain

NEXTAUTH_SECRET
Value: Generate with: openssl rand -base64 32
Important: Use a STRONG secret for production

GOOGLE_CLIENT_ID
Value: Your Google OAuth Client ID

GOOGLE_CLIENT_SECRET
Value: Your Google OAuth Client Secret
```

---

## Step 2: Update Google OAuth Redirect URI

In Google Cloud Console:

1. Go to your OAuth Client ID
2. Under "Authorized redirect URIs", add:

```
https://your-domain.vercel.app/api/auth/callback/google
```

**IMPORTANT:**
- Use HTTPS (not http)
- Use your actual Vercel domain
- No trailing slash
- Save changes in Google Console

---

## Step 3: Common Mistakes

❌ **Wrong NEXTAUTH_URL:**
- Don't use `http://` (use `https://`)
- Don't use `localhost`
- Must match your Vercel domain exactly

❌ **Wrong DATABASE_URL:**
- Make sure it's accessible from Vercel
- If using local database, it won't work
- Use a cloud database (e.g., Supabase, Neon, Railway)

❌ **Missing Google Redirect URI:**
- Must add production URL to Google Console
- Can't use localhost redirect for production

✅ **Correct Setup:**
```
NEXTAUTH_URL=https://your-app.vercel.app
DATABASE_URL=postgresql://user:pass@cloud-host:5432/db
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
NEXTAUTH_SECRET=(strong random string)
```

---

## Step 4: Database Setup on Production

If using a new production database:

```bash
# Connect to production database
export DATABASE_URL="your_production_url"

# Push schema
npx prisma db push

# Seed admin user
npx prisma db seed
```

---

## Step 5: Redeploy

After setting environment variables:

1. Go to Vercel dashboard
2. Click **Deployments**
3. Click **Redeploy** on latest deployment
4. OR push new commit:

```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

---

## Step 6: Test Production

1. Go to https://your-domain.vercel.app/login
2. Try email/password login
3. Try Google login
4. Both should work!

---

## Debugging Production Issues:

### Check Logs:

1. Vercel Dashboard → your project
2. Click **Logs** or **Functions**
3. Look for errors

### Common Errors:

**"Can't reach database server"**
- DATABASE_URL is wrong
- Database not accessible from Vercel
- Firewall blocking connections

**"Invalid `prisma.client`"**
- Need to run `npx prisma generate` in build
- Vercel does this automatically, but check build logs

**"NEXTAUTH_SECRET must be provided"**
- Environment variable not set in Vercel
- Check Settings → Environment Variables

**"redirect_uri_mismatch"**
- Google Console doesn't have production redirect URI
- Add: https://your-domain.vercel.app/api/auth/callback/google

---

## Environment Variables Checklist:

- [ ] DATABASE_URL (production database)
- [ ] NEXTAUTH_URL (https://your-domain.vercel.app)
- [ ] NEXTAUTH_SECRET (strong random string)
- [ ] GOOGLE_CLIENT_ID (from Google Console)
- [ ] GOOGLE_CLIENT_SECRET (from Google Console)
- [ ] All variables set for "Production" environment in Vercel
- [ ] Google Console has production redirect URI
- [ ] Production database has schema (prisma db push)
- [ ] Production database has admin user (prisma db seed)

---

## Quick Test:

After deployment, test these URLs:

```
https://your-domain.vercel.app/api/test-db
```

Should show admin user data. If it shows error, database isn't set up.

```
https://your-domain.vercel.app/login
```

Should show login page. Try logging in.

---

## Still Having Issues?

Share:
1. Vercel deployment logs (Functions tab)
2. Response from /api/test-db endpoint
3. Screenshot of environment variables (hide secrets)
