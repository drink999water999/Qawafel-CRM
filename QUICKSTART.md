# Quick Start Guide - Qawafel CRM

Get your CRM up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed ([Download](https://nodejs.org/))
- A PostgreSQL database (see options below)

## 1. Install Dependencies

```bash
cd qawafel-crm-nextjs
npm install
```

## 2. Set Up Database

### Easy Option: Use Neon (Free PostgreSQL)

1. Visit [neon.tech](https://neon.tech)
2. Sign up (free)
3. Create a new project
4. Copy the connection string

### Alternative Options:
- **Supabase**: [supabase.com](https://supabase.com) - Free PostgreSQL + extras
- **Railway**: [railway.app](https://railway.app) - Free trial
- **Local**: Install PostgreSQL on your machine

## 3. Configure Environment

```bash
# Create .env file
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
GEMINI_API_KEY="optional_for_ai_features"
```

**Get Gemini API Key (Optional):**
- Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create API key (free)
- Paste in `.env`

## 4. Initialize Database

```bash
# Generate Prisma client
npm run prisma:generate

# Create database tables
npm run prisma:push

# Add sample data
npm run prisma:seed
```

## 5. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎉 You're Done!

Your CRM should now be running with sample data!

## What's Included?

- **2 Retailers** - Sample retail partners
- **2 Vendors** - Sample vendors
- **3 Leads** - Potential customers
- **3 Deals** - Sales pipeline items
- **2 Proposals** - Business proposals
- **2 Support Tickets** - Sample tickets
- **Activity Feed** - Recent actions

## Next Steps

### Explore Features

1. **Dashboard** - View key metrics
2. **Leads** - Manage sales prospects
3. **Deals** - Track your pipeline
4. **Vendors** - Oversee vendor relationships
5. **Retailers** - Manage retail partners
6. **Proposals** - Create business proposals
7. **Settings** - Update your profile

### Customize

- Edit components in `/components`
- Modify database schema in `/prisma/schema.prisma`
- Update types in `/lib/types.ts`

### Deploy to Production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deploying to Vercel

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run prisma:studio   # Visual database editor
npm run prisma:push     # Update database schema
npm run prisma:seed     # Add sample data

# Lint
npm run lint            # Check code quality
```

## Troubleshooting

### "Cannot connect to database"
- Check DATABASE_URL in `.env`
- Ensure PostgreSQL is running
- Verify network access to database

### "Prisma Client not initialized"
```bash
npm run prisma:generate
```

### "Build fails"
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### "Port 3000 already in use"
```bash
# Use different port
PORT=3001 npm run dev
```

## Database Management

### View/Edit Data:
```bash
npm run prisma:studio
```
Opens visual database editor at http://localhost:5555

### Reset Database:
```bash
npx prisma db push --force-reset
npm run prisma:seed
```
⚠️ **Warning:** This deletes all data!

## Getting Help

- 📖 [Full README](./README.md)
- 🚀 [Deployment Guide](./DEPLOYMENT.md)
- 📘 [Next.js Docs](https://nextjs.org/docs)
- 🗄️ [Prisma Docs](https://www.prisma.io/docs)

## Project Structure

```
qawafel-crm-nextjs/
├── app/                # Next.js app
│   ├── api/           # API routes
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Home page
├── components/        # React components
├── lib/               # Utilities
│   ├── actions.ts    # Server actions
│   ├── prisma.ts     # Database client
│   └── gemini.ts     # AI service
├── prisma/
│   ├── schema.prisma # Database schema
│   └── seed.ts       # Sample data
└── .env              # Environment variables
```

## Tips

💡 **Use Prisma Studio** to visualize and edit your data
💡 **AI features optional** - app works without Gemini API key
💡 **Hot reload** - Changes auto-refresh in dev mode
💡 **Type safety** - TypeScript catches errors early

---

**Need more help?** Check the full [README.md](./README.md)

Happy CRM-ing! 🚀
