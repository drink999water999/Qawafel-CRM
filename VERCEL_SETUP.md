# VERCEL DEPLOYMENT INSTRUCTIONS

## ⚠️ IMPORTANT: After deploying, you MUST seed the database

### Step 1: Deploy to Vercel
1. Push code to GitHub
2. Import to Vercel
3. Add environment variable:
   - `DATABASE_URL` = Your PostgreSQL connection string

### Step 2: Seed the Database (REQUIRED!)

After deployment, you need to create the admin user and sample data.

**Option A: Using Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link your project
vercel link

# Run seed command
vercel exec -- npm run prisma:seed
```

**Option B: Using Prisma Studio locally**
```bash
# Set your production DATABASE_URL in .env
DATABASE_URL="your-production-database-url"

# Run seed
npm run prisma:seed
```

**Option C: Manual SQL (If above don't work)**
Connect to your database and run:
```sql
INSERT INTO users (username, password, role, created_at)
VALUES ('admin', 'admin', 'admin', NOW())
ON CONFLICT (username) DO NOTHING;
```

### Step 3: Test Login
1. Go to your deployed site
2. Login with:
   - Username: `admin`
   - Password: `admin`

### Troubleshooting Login Issues

**"Invalid username or password"**
- Make sure you ran the seed command
- Check Vercel logs for database connection errors
- Verify DATABASE_URL is correct

**"Database connection failed"**
- Check DATABASE_URL is set in Vercel environment variables
- Make sure your database allows connections from `0.0.0.0/0`
- For Neon/Supabase: Use the pooled connection string

**Still not working?**
1. Go to Vercel dashboard
2. Check "Deployments" → "Functions" logs
3. Look for console.log messages from login attempt
4. Should see: "Login attempt for: admin" and "User found: Yes/No"

### Environment Variables on Vercel

Required:
```
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

### Database Providers

**Neon (Recommended)**
- Free tier available
- Get connection string from dashboard
- Use "Pooled connection" string

**Supabase**
- Free tier available
- Go to Settings → Database
- Copy "Connection string" (Pooled mode)

**Railway**
- Free tier available
- Copy PostgreSQL connection string

All providers need to allow external connections (0.0.0.0/0)
