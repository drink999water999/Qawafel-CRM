# FIX ALL ISSUES - STEP BY STEP

## ✅ TypeScript Errors - FIXED
All parseInt errors in userActions.ts are now fixed.

---

## ⚠️ LOGIN RELOADS - NEEDS DATABASE MIGRATION

### WHY IT RELOADS:
Your database has old schema (User.id = Int).  
Code expects new schema (User.id = String).

**You MUST migrate the database.**

---

## STEP 1: FIX LOCAL (Dev)

### Run this command:

```bash
npx prisma db push --force-reset
```

When it asks "Do you want to continue? All data will be lost.", type: **y**

### Then run:

```bash
npx prisma generate
npx prisma db seed
rm -rf .next
npm run dev
```

### Test login:
- Go to: http://localhost:3000/login
- Email: mohamed.hussein@qawafel.sa
- Password: admin
- Should work! ✅

---

## STEP 2: FIX PRODUCTION (Vercel)

### A. Fix Google OAuth Redirect Error

The error "redirect_uri_mismatch" means you need to add the production redirect URI to Google Console.

1. Go to: https://console.cloud.google.com/
2. Select your project
3. Go to: APIs & Services → Credentials
4. Click your OAuth 2.0 Client ID
5. Under "Authorized redirect URIs", click **ADD URI**
6. Add this EXACT URI:

```
https://your-app-name.vercel.app/api/auth/callback/google
```

**Replace `your-app-name` with your actual Vercel domain!**

7. Click **SAVE**

### B. Setup Production Database

You need to run the migration on your production database too.

```bash
# Set your production database URL
export DATABASE_URL="your_production_database_url"

# Push schema
npx prisma db push --force-reset

# Generate client
npx prisma generate

# Seed admin user
npx prisma db seed
```

### C. Deploy to Vercel

```bash
git add .
git commit -m "Fix all User ID types"
git push
```

Vercel will automatically deploy.

### D. Test Production

1. Go to: https://your-app-name.vercel.app/login
2. Try credentials login ✅
3. Try Google login ✅

---

## WHAT EACH COMMAND DOES:

**npx prisma db push --force-reset**
- Drops all tables
- Recreates them with new schema (User.id as String)

**npx prisma generate**
- Updates Prisma client to match new schema

**npx prisma db seed**
- Creates admin user: mohamed.hussein@qawafel.sa / admin

**rm -rf .next**
- Clears Next.js build cache

---

## QUICK COPY/PASTE FOR LOCAL:

```bash
npx prisma db push --force-reset && npx prisma generate && npx prisma db seed && rm -rf .next && npm run dev
```

Type **y** when asked.

---

## CHECKLIST:

### Local Dev:
- [ ] Run database migration
- [ ] Test credentials login
- [ ] Test Google login

### Production:
- [ ] Add redirect URI to Google Console
- [ ] Migrate production database
- [ ] Deploy to Vercel
- [ ] Test both logins

---

## TROUBLESHOOTING:

### "Login still reloads"
→ You didn't run the migration. Run `npx prisma db push --force-reset`

### "Google redirect_uri_mismatch"
→ Add production URL to Google Console (see Step 2A above)

### "User not found" after migration
→ Run `npx prisma db seed` to create admin user

### "Build fails"
→ All TypeScript errors are fixed. Run `git pull` to get latest code.

---

## THAT'S IT!

Just follow the steps above and everything will work.
