# RUN THIS NOW - Fix Both Issues

## Issue 1: Local Login Refreshes Page

**YOU MUST RUN THE DATABASE MIGRATION**

Run this command:

```bash
npx prisma migrate reset --force
```

When it asks "Are you sure?", type: **y**

Then:

```bash
npx prisma generate
npx prisma db seed
rm -rf .next
npm run dev
```

**Then try logging in again.** It will work.

---

## Issue 2: Production Build Error

**FIXED** - The parseInt error is now fixed in the code.

After running the local migration above, deploy:

```bash
git add .
git commit -m "Fix user ID type"
git push
```

---

## WHY YOU MUST RUN THE MIGRATION:

The database schema changed:
- **Before:** User.id was Int (1, 2, 3...)
- **After:** User.id is String (for Google IDs)

**Your database still has the old schema.**

That's why:
- ❌ Credentials login refreshes (can't create session with old schema)
- ❌ Google login fails (ID too big for Int)
- ❌ Build fails (code expects String, database has Int)

**Running the migration fixes ALL of this.**

---

## STEP BY STEP:

### 1. Stop your dev server (Ctrl+C)

### 2. Run migration:
```bash
npx prisma migrate reset --force
```

Type **y** when asked

### 3. Regenerate:
```bash
npx prisma generate
```

### 4. Seed admin user:
```bash
npx prisma db seed
```

You should see:
```
✓ Admin user created
```

### 5. Clear build cache:
```bash
rm -rf .next
```

### 6. Start server:
```bash
npm run dev
```

### 7. Test login:

Go to: http://localhost:3000/login

**Email:** mohamed.hussein@qawafel.sa  
**Password:** admin

Should redirect to dashboard ✅

---

## For Production:

After local migration works:

### 1. Set Vercel environment variables (if not done):
- DATABASE_URL
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET

### 2. Setup production database:
```bash
export DATABASE_URL="your_production_url"
npx prisma db push
npx prisma db seed
```

### 3. Deploy:
```bash
git add .
git commit -m "Fix user ID schema"
git push
```

Vercel will build and deploy ✅

---

## THAT'S IT

Just run the migration and everything works.

**DO NOT SKIP THE MIGRATION.**

Without it, nothing will work.
