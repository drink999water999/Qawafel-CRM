# Google Sign-In Setup Guide

## Overview
The CRM now supports Google Sign-In with admin approval. Users can sign up with their Google account, and admins can approve or reject signup requests.

## Current Status
✅ Database schema updated (User & SignupRequest models)
✅ Admin approval page created
✅ User management interface ready
✅ Phone column added to leads page
✅ Admin email set to mohamed.hussein@qawafel.sa

## Next Steps to Enable Google OAuth

### 1. Install NextAuth.js
```bash
npm install next-auth@beta
```

### 2. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set Application Type: "Web application"
6. Add Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

7. Copy your:
   - Client ID
   - Client Secret

### 3. Add Environment Variables

Create/update `.env.local`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here_generate_with_openssl

# Database (already set)
DATABASE_URL=your_database_url
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 4. Create NextAuth Configuration

Create `app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import { createSignupRequest } from "@/lib/auth";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (existingUser) {
          // Check if approved
          if (!existingUser.approved) {
            return `/login?error=pending`;
          }
          return true;
        }

        // Create signup request
        await createSignupRequest({
          email: user.email!,
          name: user.name!,
          image: user.image,
        });

        return `/login?error=signup_requested`;
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email! },
        });
        if (dbUser) {
          session.user.role = dbUser.role;
          session.user.approved = dbUser.approved;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});

export { handler as GET, handler as POST };
```

### 5. Update Login Page

The login page is already updated with Google Sign-In button. No changes needed!

### 6. Run Database Migration

```bash
npm run prisma:push
npm run prisma:seed
```

This will:
- Create `signup_requests` table
- Update `users` table with new fields
- Create admin user with email: mohamed.hussein@qawafel.sa

## How It Works

### For New Users (Google Sign-In):
1. User clicks "Sign in with Google"
2. Google authentication flow
3. System creates a signup request
4. User sees "Your signup request is pending approval"
5. Admin approves the request
6. User can now log in

### For Admins:
1. Log in with credentials (email/password)
2. Navigate to "User Approvals" in sidebar
3. See pending signup requests
4. Approve or reject users
5. Manage existing user access (block/approve)

### For Existing Users:
1. Use email/password login (credentials)
2. OR use Google Sign-In if already approved

## Admin User

**Default Admin:**
- Email: `mohamed.hussein@qawafel.sa`
- Username: `admin`
- Password: `admin` (change in production!)
- Role: `admin`
- Approved: `true`

## Testing the Flow

### 1. Test Signup Request
```bash
# Seed the database first
npm run prisma:seed

# Try logging in with Google
# Should create a signup request
```

### 2. Test Admin Approval
```bash
# Log in as admin
Email: mohamed.hussein@qawafel.sa
Password: admin

# Go to "User Approvals"
# Approve the pending request
```

### 3. Test User Login
```bash
# Log in with approved Google account
# Should work!
```

## Security Notes

1. **Change default admin password** in production
2. **Set strong NEXTAUTH_SECRET**
3. **Use HTTPS** in production
4. **Restrict Google OAuth** to your domain if needed
5. **Enable 2FA** for admin accounts

## Troubleshooting

### "Sign in with Google" button doesn't work
- Check GOOGLE_CLIENT_ID is set
- Verify redirect URI matches Google Console
- Check browser console for errors

### "Your signup request is pending"
- This is correct! Admin needs to approve
- Check signup_requests table for the entry
- Log in as admin to approve

### Can't log in as admin
- Make sure you ran `npm run prisma:seed`
- Check users table has the admin user
- Verify email: mohamed.hussein@qawafel.sa

### "Database connection failed"
- Check DATABASE_URL is correct
- Ensure Prisma schema is pushed
- Verify database is running

## Next Steps

1. Install NextAuth: `npm install next-auth@beta`
2. Set up Google OAuth credentials
3. Add environment variables
4. Create NextAuth route file
5. Run migrations
6. Test the flow!

## Support

For issues or questions:
1. Check browser console
2. Check server logs
3. Verify environment variables
4. Check database tables

The approval system is ready to use! Just need to complete the OAuth setup.
