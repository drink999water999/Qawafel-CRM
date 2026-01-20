# 🧪 TEST LOGIN - Step by Step

## Before Testing - Setup Database

### 1. Make sure .env.local exists with:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/qawafel_crm"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="any-random-string-here"
```

**Note**: NEXTAUTH_SECRET can be anything for testing. A default is provided.

### 2. Update Database Schema
```bash
npx prisma db push
```

**Expected output**: ✅ Schema pushed successfully

### 3. Create Admin User
```bash
npx prisma db seed
```

**Expected output**: ✅ Admin user created

### 4. Verify Database
```bash
npm run test:db
```

**Expected output**: All ✅ green checkmarks

---

## Test Credentials Login

### 1. Start dev server
```bash
npm run dev
```

### 2. Open browser
Go to: http://localhost:3000/login

### 3. Look at terminal
You should see:
```
○ Compiling / ...
✓ Compiled / in XXXms
```

### 4. Try to login

**Email**: `mohamed.hussein@qawafel.sa`  
**Password**: `admin`

### 5. Watch terminal logs

You should see:
```
🔐 Credentials Login Attempt
📧 Email: mohamed.hussein@qawafel.sa
✅ User found: { email: '...', hasPassword: true, approved: true, role: 'admin' }
✅ Login successful!
🔑 SignIn Callback
Provider: credentials
User email: mohamed.hussein@qawafel.sa
✅ Credentials login - allowing
```

### 6. What happens?

**SUCCESS**: You're redirected to dashboard at http://localhost:3000/

**FAILURE**: Error message shows. Check terminal for:
- ❌ User not found → Run `npx prisma db seed`
- ❌ Password incorrect → Check you typed `admin` correctly
- ❌ User not approved → Run `npx prisma db seed` again

---

## Test Google Sign-In

### 1. Check if Google OAuth is configured

In `.env.local`:
```env
GOOGLE_CLIENT_ID="your-actual-client-id"
GOOGLE_CLIENT_SECRET="your-actual-secret"
```

**Don't have these?**
- Google sign-in will show error
- Credentials login still works!
- See GOOGLE_OAUTH_SETUP.md for setup

### 2. Try Google Sign-In

Click "Sign in with Google" button

**With Google OAuth configured:**
- Google popup appears
- Choose your Google account
- First time: "Signup request submitted"
- Admin approves you
- Second time: You're logged in!

**Without Google OAuth:**
- Error message: "Error connecting to Google"
- This is OK! Use credentials login instead

---

## Expected Behaviors

### Scenario 1: First Time Google User
1. Click "Sign in with Google"
2. Choose Google account
3. See: "Signup request submitted!"
4. Admin must approve in "User Approvals"
5. Try again → Success!

### Scenario 2: Existing Email, New Google Login
**Example**: You have account mohamed@example.com with password

1. Sign in with Google using mohamed@example.com
2. If approved → Login successful! (no password needed)
3. Your account now works with both password AND Google

### Scenario 3: Credentials Login
1. Enter email and password
2. Click "Login with Email"
3. Redirected to dashboard

### Scenario 4: Wrong Password
1. Enter wrong password
2. See: "Invalid email or password"
3. Terminal shows: ❌ Password incorrect

---

## Common Issues

### "User not found in database"
**Fix**: 
```bash
npx prisma db seed
```

### "Password incorrect"
- Make sure password is exactly: `admin` (lowercase)
- No spaces before/after

### "User not approved"
**Fix**:
```bash
npx prisma db seed
```
This sets approved=true for admin

### Google button does nothing
**Causes**:
1. GOOGLE_CLIENT_ID not set → OK, use credentials
2. GOOGLE_CLIENT_SECRET not set → OK, use credentials
3. Google OAuth not configured → OK, use credentials

**Solution**: You don't need Google OAuth to use the CRM!

### "Error connecting to Google"
This is OK! It means Google OAuth isn't set up. Use credentials login.

---

## Quick Verification Script

Run this to verify everything:

```bash
# 1. Test database
npm run test:db

# 2. Start dev server
npm run dev

# 3. In browser: http://localhost:3000/login

# 4. Login with:
#    Email: mohamed.hussein@qawafel.sa
#    Password: admin
```

---

## What You'll See When It Works

### Terminal (when logging in):
```
🔐 Credentials Login Attempt
📧 Email: mohamed.hussein@qawafel.sa
✅ User found: { email: 'mohamed.hussein@qawafel.sa', ... }
✅ Login successful!
🔑 SignIn Callback
✅ Credentials login - allowing
```

### Browser:
- Redirects to http://localhost:3000/
- Shows main dashboard
- Your name/email in top right

---

## Still Not Working?

1. **Delete everything and start fresh:**
```bash
rm -rf .next
rm -rf node_modules
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

2. **Check database in Prisma Studio:**
```bash
npx prisma studio
```
- Open `users` table
- Find: mohamed.hussein@qawafel.sa
- Verify: approved = true, password = "admin"

3. **Share terminal logs**
Copy the terminal output when you try to login and share it.

---

## Success Checklist

Before testing, verify:
- ✅ `.env.local` exists with DATABASE_URL, NEXTAUTH_URL
- ✅ `npm run test:db` shows all green ✅
- ✅ Database has admin user (check in Prisma Studio)
- ✅ Dev server is running (`npm run dev`)

Then:
- ✅ Go to http://localhost:3000/login
- ✅ Enter: mohamed.hussein@qawafel.sa / admin
- ✅ Click "Login with Email"
- ✅ Redirected to dashboard

**If all checkmarks are ✅, login WILL work!**
