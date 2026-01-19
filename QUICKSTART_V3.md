# 🚀 Quick Start Guide - v3

## Step 1: Extract & Install
```bash
unzip qawafel-crm-nextjs-FIXED-v3.zip
cd qawafel-crm-nextjs
npm install
```

## Step 2: Database Setup

### Get Free PostgreSQL Database:
- **Option A:** [Neon](https://neon.tech) - Best for development
- **Option B:** [Supabase](https://supabase.com) - Includes more features
- **Option C:** Local PostgreSQL

### Configure:
```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your DATABASE_URL
# Example: postgresql://user:password@host:5432/database
```

## Step 3: Initialize Database
```bash
# Push database schema (creates all tables including User table)
npm run prisma:push

# Seed with sample data (creates admin user)
npm run prisma:seed
```

## Step 4: Start the App
```bash
npm run dev
```

Open: http://localhost:3000

## Step 5: Login

You'll be automatically redirected to the login page.

**Default Credentials:**
- Username: `admin`
- Password: `admin`

Click "Login" and you're in! 🎉

## What You Can Do Now:

### 1. ✅ Manage Leads
- Add, edit, delete leads
- Track lead status
- View lead pipeline

### 2. ✅ Drag & Drop Deals
- **NEW in v3!** Drag deals between pipeline stages
- Visual kanban board
- Real-time updates

### 3. ✅ Manage Vendors & Retailers
- Full CRUD operations
- Status management
- Contact information

### 4. ✅ Create Proposals
- Draft and send proposals
- Track proposal status
- Manage client information

### 5. ✅ Dashboard Analytics
- Live statistics
- Activity feed
- Pipeline value tracking

### 6. ✅ Logout
- Click the logout button (top right)
- Secure session management

## Adding More Users

### Method 1: Prisma Studio (GUI)
```bash
npm run prisma:studio
```
Navigate to `users` table and add new records.

### Method 2: Seed File
Edit `prisma/seed.ts` and add:
```typescript
const newUser = await prisma.user.upsert({
  where: { username: 'john' },
  update: {},
  create: {
    username: 'john',
    password: 'password123',
    role: 'user',
  },
});
```
Then run: `npm run prisma:seed`

### Method 3: Direct SQL
```sql
INSERT INTO users (username, password, role, created_at)
VALUES ('john', 'password123', 'user', NOW());
```

## Features Overview

| Feature | Status | Description |
|---------|--------|-------------|
| Login System | ✅ | Secure authentication |
| Drag & Drop | ✅ | Move deals between stages |
| CRUD Operations | ✅ | All entities (Leads, Deals, etc.) |
| Dashboard | ✅ | Analytics and metrics |
| Proposals | ✅ | Create and track proposals |
| User Management | ✅ | Multiple users support |
| Logout | ✅ | Secure session clearing |

## Troubleshooting

### Can't login?
- Make sure you ran `npm run prisma:seed`
- Check database connection
- Verify admin user exists: `npm run prisma:studio`

### Drag & drop not working?
- Make sure you're clicking and holding
- Drag to a different column (not the same one)
- Page will reload after successful drop

### Database errors?
- Verify DATABASE_URL in `.env`
- Check PostgreSQL is running
- Try: `npm run prisma:push` again

## Next Steps

1. **Explore the app** - Click around and test features
2. **Add your data** - Replace sample data with real information
3. **Customize** - Modify components to fit your needs
4. **Deploy** - See `DEPLOYMENT.md` for Vercel deployment

## Documentation

- `README.md` - Complete documentation
- `AUTH.md` - Authentication system details
- `CHANGELOG_V3.md` - What's new in v3
- `DEPLOYMENT.md` - Deployment guide
- `QUICKSTART.md` - This file

## Need Help?

Check the documentation files or review the code comments for detailed explanations.

---

**That's it! You're ready to use the CRM! 🎊**
