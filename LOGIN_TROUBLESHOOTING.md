# Login Troubleshooting Guide

## 🚨 Getting "Error occurred while logging in"?

Follow these steps in order:

### Step 1: Test Your Database Connection

Run the database test script:
```bash
npm run test:db
```

This will check:
- ✅ Database connection
- ✅ Users table exists with correct schema
- ✅ Admin user exists and is approved
- ✅ Environment variables are set

### Step 2: Update Database Schema

If the test shows missing tables or wrong schema:
```bash
npx prisma db push
```

This updates your database with the new fields needed for Google OAuth and user approval.

### Step 3: Create Admin User

If admin user doesn't exist:
```bash
npx prisma db seed
```

This creates the default admin:
- **Email**: `mohamed.hussein@qawafel.sa`
- **Password**: `admin`
- **Role**: `admin`
- **Approved**: `true`

### Step 4: Verify Environment Variables

Check your `.env.local` file has these REQUIRED variables:

```env
DATABASE_URL="your_database_url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generated_secret_here"
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### Step 5: Restart Everything

```bash
# Delete build cache
rm -rf .next

# Restart dev server
npm run dev
```

### Step 6: Try Logging In

Go to: http://localhost:3000/login

Use:
- **Email**: `mohamed.hussein@qawafel.sa`
- **Password**: `admin`

## 🔍 Check Server Console

When you try to login, you should see these logs in your terminal:

```
Attempting login for: mohamed.hussein@qawafel.sa
User found: Yes
Login successful for: mohamed.hussein@qawafel.sa
```

### If you see different logs:

**`User found: No`**
- Admin user doesn't exist
- Run: `npx prisma db seed`

**`Password mismatch`**
- You're using wrong password
- Default is: `admin`

**`User not approved`**
- User exists but not approved
- Run: `npx prisma db seed` again

**Database connection errors**
- DATABASE_URL is wrong or database is not running
- Check your database is running
- Verify DATABASE_URL in `.env.local`

## 🔧 Manual Database Check

Open Prisma Studio to see your database:
```bash
npx prisma studio
```

1. Click on **users** table
2. Look for user with email: `mohamed.hussein@qawafel.sa`
3. Verify:
   - ✅ `approved` = true
   - ✅ `role` = "admin"
   - ✅ `password` = "admin"
   - ✅ `email` = "mohamed.hussein@qawafel.sa"

If the user doesn't exist or fields are wrong, run:
```bash
npx prisma db seed
```

## 🌐 Google Sign-In Issues

If Google Sign-In shows errors:

### Error: "signup_requested"
- This is CORRECT for new users!
- New Google users need admin approval
- Login as admin to approve them

### Error: "pending"
- User exists but not approved
- Login as admin and approve in "User Approvals" page

### Other Google errors
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set
- Verify redirect URI in Google Console: `http://localhost:3000/api/auth/callback/google`
- Make sure Google OAuth is enabled in Google Cloud Console

## 📝 Common Issues

### Issue: "Invalid email or password"

**Cause**: Wrong credentials or user doesn't exist

**Fix**:
1. Make sure you're using: `mohamed.hussein@qawafel.sa`
2. Password is: `admin` (lowercase)
3. Run: `npm run test:db` to verify user exists

### Issue: Build fails

**Cause**: Missing or wrong database schema

**Fix**:
```bash
npx prisma generate
npx prisma db push
npm run build
```

### Issue: Can't connect to database

**Cause**: Wrong DATABASE_URL or database not running

**Fix**:
1. Check your database is running (PostgreSQL, MySQL, etc.)
2. Verify DATABASE_URL format:
   - PostgreSQL: `postgresql://user:password@localhost:5432/database`
   - MySQL: `mysql://user:password@localhost:3306/database`
3. Test connection: `npx prisma db push`

### Issue: Environment variables not loading

**Cause**: File named wrong or in wrong location

**Fix**:
1. Make sure file is named `.env.local` (not `.env` or `env.local`)
2. File must be in project root (same folder as package.json)
3. Restart dev server after changes

## 🎯 Quick Fix Checklist

Run these commands in order:

```bash
# 1. Test database
npm run test:db

# 2. Update schema
npx prisma db push

# 3. Seed admin user
npx prisma db seed

# 4. Generate Prisma client
npx prisma generate

# 5. Clear build cache
rm -rf .next

# 6. Restart dev server
npm run dev
```

Then try logging in with:
- Email: `mohamed.hussein@qawafel.sa`
- Password: `admin`

## 💡 Still Not Working?

1. **Share your logs**: Copy the terminal output when you try to login
2. **Check Prisma Studio**: Run `npx prisma studio` and screenshot the users table
3. **Verify .env.local**: Make sure all required variables are set

### Debug Mode

NextAuth is configured with debug mode in development. Check your terminal for detailed error logs when signing in.

## 📚 Related Documentation

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database setup instructions
- [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md) - Full Google OAuth setup
- [.env.example](./.env.example) - Environment variables template
