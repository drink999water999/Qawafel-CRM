# URGENT: Database Setup Required

## ⚠️ If you're getting login errors, you need to update your database schema!

### Step 1: Update Database Schema
Run this command to update your database with the new user fields:

```bash
npx prisma db push
```

This will add the new fields to your database:
- `users` table: email, name, image, provider, approved
- `signup_requests` table (new)

### Step 2: Seed Admin User
Run this to create the admin account:

```bash
npx prisma db seed
```

This creates:
- Email: `mohamed.hussein@qawafel.sa`
- Password: `admin`
- Role: `admin`
- Approved: `true`

### Step 3: Set Environment Variables
Make sure you have these in `.env.local`:

```env
# Required for the app to work
DATABASE_URL="your_database_url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Optional - only needed for Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-secret"
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### Step 4: Check Database Connection
Make sure your database is running and accessible:

```bash
# Test Prisma connection
npx prisma studio
```

This should open Prisma Studio. If it fails, your DATABASE_URL is wrong.

### Step 5: Restart Development Server
```bash
npm run dev
```

## Common Issues

### "Error occurred while logging in"
- **Cause**: Database schema not updated
- **Fix**: Run `npx prisma db push` then `npx prisma db seed`

### "Invalid email or password"
- **Cause**: Admin user not created
- **Fix**: Run `npx prisma db seed`
- **Or**: Check you're using correct email: `mohamed.hussein@qawafel.sa`

### "Database connection failed"
- **Cause**: Wrong DATABASE_URL or database not running
- **Fix**: Check your database is running and DATABASE_URL is correct

### Google Sign-In not working
- **Cause**: Missing environment variables
- **Fix**: Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- **Or**: Google OAuth not set up in Google Console

## Verify Setup

1. **Check database tables exist:**
```bash
npx prisma studio
```
Look for:
- `users` table with: id, email, name, image, provider, approved, password, role
- `signup_requests` table with: id, email, name, image, provider, status

2. **Check admin user exists:**
In Prisma Studio, open `users` table and verify:
- Email: `mohamed.hussein@qawafel.sa`
- Approved: `true`
- Role: `admin`

3. **Check environment variables:**
```bash
# In your terminal
echo $NEXTAUTH_SECRET
```
Should output a random string (not empty)

## Quick Debug

Check server console for these logs:
```
Attempting login for: mohamed.hussein@qawafel.sa
User found: Yes
Login successful for: mohamed.hussein@qawafel.sa
```

If you see:
- `User found: No` → Run `npx prisma db seed`
- `Password mismatch` → Check you're using password: `admin`
- Database errors → Run `npx prisma db push`

## Still Not Working?

1. Delete `.next` folder:
```bash
rm -rf .next
```

2. Restart dev server:
```bash
npm run dev
```

3. Try logging in again with:
   - Email: `mohamed.hussein@qawafel.sa`
   - Password: `admin`

4. Check the terminal console for error logs
