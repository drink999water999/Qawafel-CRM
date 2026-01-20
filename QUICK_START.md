# 🚀 QUICK START - Fix Login Issues

## Run These Commands (in order):

### 1. Test Your Database
```bash
npm run test:db
```

**Look for**:
- ✅ Database connection successful
- ✅ Users table exists
- ✅ Admin user found

**If anything shows ❌**, continue to step 2.

### 2. Fix Database Schema
```bash
npx prisma db push
```

### 3. Create Admin User
```bash
npx prisma db seed
```

### 4. Restart Dev Server
```bash
rm -rf .next
npm run dev
```

### 5. Login
Go to: http://localhost:3000/login

**Email**: `mohamed.hussein@qawafel.sa`  
**Password**: `admin`

---

## 📋 Environment Variables Checklist

Make sure `.env.local` exists with:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/qawafel_crm"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
```

---

## 🔍 Watch Your Terminal

When you click "Login", you should see:
```
Attempting login for: mohamed.hussein@qawafel.sa
User found: Yes
Login successful for: mohamed.hussein@qawafel.sa
```

---

## ⚠️ Common Errors & Fixes

### Error: "User found: No"
**Fix**: `npx prisma db seed`

### Error: "Password mismatch"
**Fix**: Use password `admin` (lowercase)

### Error: Database connection errors
**Fix**: Check DATABASE_URL in `.env.local`

### Error: "NEXTAUTH_SECRET must be provided"
**Fix**: 
```bash
# Generate secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET="paste_generated_secret_here"
```

---

## 📖 More Help

- **Detailed troubleshooting**: See [LOGIN_TROUBLESHOOTING.md](./LOGIN_TROUBLESHOOTING.md)
- **Database setup**: See [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- **Full guide**: See [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)

---

## 💬 What the Test Script Checks

`npm run test:db` verifies:
1. ✅ Database connection works
2. ✅ Users table has correct schema
3. ✅ Admin user exists with:
   - Email: mohamed.hussein@qawafel.sa
   - Approved: true
   - Role: admin
4. ✅ Signup requests table exists
5. ✅ All environment variables are set

If everything shows ✅, login should work!
