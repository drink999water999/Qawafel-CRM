# Qawafel CRM - Full Stack Next.js Application

A comprehensive B2B marketplace CRM system for managing retailers, vendors, leads, deals, proposals, and support tickets with AI-powered communication features.

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js Server Actions, Prisma ORM
- **Database:** PostgreSQL
- **AI:** Google Gemini API for message generation
- **Deployment:** Vercel

## Features

- 📊 **Dashboard** - Overview of key metrics and recent activities
- 👥 **Retailer Management** - Track and manage retail partners
- 🏪 **Vendor Management** - Oversee vendor relationships
- 🎯 **Lead Tracking** - Capture and nurture sales leads
- 💼 **Deal Pipeline** - Visual deal stage management
- 📄 **Proposal Management** - Create and track business proposals
- 🎫 **Support Tickets** - Handle customer support requests
- 🤖 **AI-Powered Messaging** - Generate professional communications using Google Gemini

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google Gemini API key (optional, for AI features)

## Local Development Setup

### 1. Clone or Extract the Project

```bash
cd qawafel-crm-nextjs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database - Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/qawafel_crm?schema=public"

# Google Gemini API Key (optional - for AI features)
GEMINI_API_KEY="your_gemini_api_key_here"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### Getting a PostgreSQL Database:

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb qawafel_crm

# Your DATABASE_URL will be:
# postgresql://your_username@localhost:5432/qawafel_crm
```

**Option B: Free Cloud PostgreSQL (Recommended for Testing)**
- [Neon](https://neon.tech) - Free tier with PostgreSQL
- [Supabase](https://supabase.com) - Free tier with PostgreSQL
- [Railway](https://railway.app) - Free tier available

#### Getting a Gemini API Key:

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in your `.env` file

### 4. Initialize Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database (creates tables)
npm run prisma:push

# Seed database with sample data
npm run prisma:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Management

```bash
# View/edit database with Prisma Studio
npm run prisma:studio

# Reset database (⚠️ deletes all data)
npx prisma db push --force-reset

# Re-seed after reset
npm run prisma:seed
```

## Project Structure

```
qawafel-crm-nextjs/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── globals.css          # Global styles
│   └── api/                 # API routes (if needed)
├── components/              # React components
│   ├── CRMDashboard.tsx    # Main dashboard
│   ├── Sidebar.tsx         # Navigation
│   ├── Header.tsx          # Top bar
│   └── ...                 # Other components
├── lib/                     # Utilities and actions
│   ├── prisma.ts           # Prisma client
│   ├── actions.ts          # Server actions
│   ├── gemini.ts           # AI service
│   └── types.ts            # TypeScript types
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data
├── .env                     # Environment variables (create this)
├── .env.example            # Environment template
├── package.json
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/qawafel-crm.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** .next

### 3. Add Environment Variables in Vercel

In Vercel Project Settings → Environment Variables, add:

- `DATABASE_URL` - Your PostgreSQL connection string
- `GEMINI_API_KEY` - Your Gemini API key (optional)

**Important for Database:**
- For production, use a cloud PostgreSQL service (Neon, Supabase, Railway)
- Make sure your PostgreSQL instance allows connections from Vercel's IP addresses

### 4. Deploy

```bash
# Vercel will automatically deploy on push
git push origin main
```

## Database Setup on Vercel

After first deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Run migrations in production
vercel env pull .env.production
DATABASE_URL="your_production_db" npx prisma db push

# Seed production database (optional)
DATABASE_URL="your_production_db" npm run prisma:seed
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string |
| `GEMINI_API_KEY` | ⚠️ Optional | Google Gemini API key for AI features |
| `NEXT_PUBLIC_APP_URL` | ⚠️ Optional | Your app URL (auto-detected in Vercel) |

## Common Issues & Solutions

### Database Connection Issues

```bash
# Test database connection
npx prisma db push
```

If failed:
- Check `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Verify database exists
- Check network/firewall settings

### Prisma Client Not Generated

```bash
npm run prisma:generate
```

### Build Fails on Vercel

1. Check environment variables are set
2. Ensure `DATABASE_URL` is accessible from Vercel
3. Check build logs for specific errors

## Scripts Reference

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Prisma commands
npm run prisma:generate  # Generate Prisma Client
npm run prisma:push      # Push schema to database
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database with sample data
```

## Features Overview

### Dashboard
- Key metrics overview
- Recent activity feed
- Quick stats on leads, deals, and revenue

### Retailers & Vendors
- Comprehensive contact management
- Account status tracking
- Marketplace lifecycle management
- Bulk communication tools

### Leads & Deals
- Lead capture and qualification
- Visual deal pipeline (Kanban-style)
- Deal stage tracking
- Probability and value forecasting

### Proposals
- Create and send proposals
- Track proposal status
- Client information management

### Support
- Ticket management system
- Multi-user support (retailers & vendors)
- Status tracking

### AI Communication
- Generate professional emails, SMS, WhatsApp messages
- Context-aware messaging
- Multiple templates per user type

## License

MIT

## Support

For issues and questions:
1. Check this README
2. Review [Next.js Documentation](https://nextjs.org/docs)
3. Check [Prisma Documentation](https://www.prisma.io/docs)
4. Open an issue on GitHub

---

Built with ❤️ using Next.js, Prisma, and Tailwind CSS
