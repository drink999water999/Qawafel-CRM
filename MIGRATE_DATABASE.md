# MIGRATE DATABASE - Fix Google Login ID Error

## The Problem:

Google IDs are too large for integer fields. We need to change User.id from Int to String.

## ⚠️ IMPORTANT: This Will Reset Your Database

The user table will be recreated. **You will lose existing users.**

---

## Step 1: Backup (If You Have Important Data)

```bash
# Export your data first if needed
npx prisma studio
# Manually export any important data
```

---

## Step 2: Reset Database

```bash
# This will drop and recreate all tables
npx prisma migrate reset --force
```

**OR if that doesn't work:**

```bash
# Drop the database manually
# Then:
npx prisma db push --force-reset
```

---

## Step 3: Regenerate Prisma Client

```bash
npx prisma generate
```

---

## Step 4: Seed Database

```bash
npx prisma db seed
```

This creates the admin user again:
- Email: mohamed.hussein@qawafel.sa
- Password: admin

---

## Step 5: Restart Server

```bash
rm -rf .next
npm run dev
```

---

## Step 6: Test Google Login

1. Go to http://localhost:3000/login
2. Click "Sign in with Google"
3. Select your Google account
4. Should work now! ✅

---

## What Changed:

**Before:**
```prisma
model User {
  id Int @id @default(autoincrement())
  ...
}
```

**After:**
```prisma
model User {
  id String @id @default(cuid())
  ...
}
```

This allows storing Google's large IDs.

---

## If You Get Errors:

### Error: "Relation does not exist"

```bash
npx prisma db push --force-reset
npx prisma generate
npx prisma db seed
```

### Error: "Provider not found"

```bash
rm -rf node_modules
npm install
npx prisma generate
```

---

## For Production (Vercel):

After migrating locally, deploy to Vercel:

```bash
git add .
git commit -m "Fix user ID type for Google OAuth"
git push
```

Vercel will automatically run migrations.

---

## Quick Reset Command:

```bash
npx prisma migrate reset --force && npx prisma generate && npx prisma db seed && npm run dev
```

This does everything in one command.
