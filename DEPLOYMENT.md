# Deployment Guide - Qawafel CRM

## Quick Deployment to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier available at https://vercel.com)
- PostgreSQL database (we recommend Neon, Supabase, or Railway)

### Step 1: Set Up Your Database

#### Option A: Neon (Recommended - Free Tier)

1. Go to https://neon.tech
2. Sign up for a free account
3. Create a new project
4. Copy your connection string (starts with `postgresql://`)
5. Save it - you'll need it for Vercel

#### Option B: Supabase (Free Tier)

1. Go to https://supabase.com
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (Connection pooling)
5. Make sure to use the pooling connection string

#### Option C: Railway (Free Trial)

1. Go to https://railway.app
2. Create a new project
3. Add PostgreSQL
4. Copy the connection string from the environment variables

### Step 2: Push to GitHub

```bash
# In your project directory
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 3: Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure the project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** ./
   - **Build Command:** `npm run build` (auto-set)
   - **Output Directory:** `.next` (auto-set)

4. Add Environment Variables:
   ```
   DATABASE_URL = your_postgresql_connection_string
   GEMINI_API_KEY = your_gemini_api_key (optional)
   ```

5. Click "Deploy"

### Step 4: Initialize Database

After first deployment:

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Link to your project:
   ```bash
   vercel link
   ```

4. Run database migrations:
   ```bash
   # Pull environment variables
   vercel env pull .env.production
   
   # Push schema to production database
   DATABASE_URL="your_production_db_url" npx prisma db push
   
   # Seed database (optional)
   DATABASE_URL="your_production_db_url" npm run prisma:seed
   ```

### Step 5: Verify Deployment

1. Visit your Vercel deployment URL
2. Check that the app loads correctly
3. Verify database connection by checking if data displays

## Automatic Deployments

Vercel will automatically deploy:
- On every push to `main` branch (production)
- On pull requests (preview deployments)

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Environment Variables Management

### Add New Variables:
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add variable for Production, Preview, and Development
3. Redeploy for changes to take effect

### Update Variables:
1. Edit in Vercel Dashboard
2. Trigger new deployment

## Troubleshooting

### Build Fails

**Error: Prisma Client not generated**
```bash
# Ensure postinstall script runs
# Check package.json has: "postinstall": "prisma generate"
```

**Error: Database connection failed**
- Verify DATABASE_URL is correct
- Check database allows connections from Vercel IPs
- For Neon/Supabase: ensure using connection pooling URL

### Runtime Errors

**Error: GEMINI_API_KEY not found**
- AI features are optional
- App will work without it (AI message generation won't work)

**Data not loading**
- Run `prisma db push` in production
- Check Vercel logs for errors

## Performance Optimization

1. **Enable Edge Runtime** (optional):
   - Add to API routes: `export const runtime = 'edge'`

2. **Database Connection Pooling**:
   - Use Prisma connection pooling URL
   - For Neon: Add `?pgbouncer=true&connection_limit=1`

3. **Caching**:
   - Static pages are automatically cached
   - Use `revalidate` for ISR if needed

## Monitoring

View logs in Vercel:
1. Project → Deployments → Select deployment
2. Click "View Function Logs"
3. Monitor errors and performance

## Rollback

If deployment has issues:
1. Go to Deployments
2. Find previous working deployment
3. Click "..." menu → "Promote to Production"

## Security Checklist

✅ Environment variables are set (not in code)
✅ Database credentials are secure
✅ CORS is configured (if using custom domain)
✅ Rate limiting implemented (if needed)
✅ Database has proper access controls

## Support

- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs
- Next.js Docs: https://nextjs.org/docs

---

**Cost Estimate:**
- Vercel: Free tier (hobby plan) - unlimited deployments
- Database: Free tier on Neon/Supabase
- **Total: $0/month** for hobby projects
