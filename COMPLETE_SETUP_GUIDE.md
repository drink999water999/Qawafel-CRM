# Complete Google OAuth Setup - WORKING VERSION

## ✅ What's Implemented

1. **NextAuth.js Integration** - Complete OAuth backend
2. **Google Sign-In** - Fully functional with signup requests
3. **Admin Approval System** - Approve/reject user signups
4. **User Settings** - Profile updates with password management
5. **User Avatar** - Shows first letter or Google profile image
6. **Phone Column** - Added to leads table

## 📦 Installation Steps

### 1. Install Dependencies
```bash
npm install
```

This will install:
- `next-auth@^4.24.5` - Authentication
- All other existing dependencies

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL="your_database_connection_string"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen if needed
6. Application type: "Web application"
7. Add Authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
8. Copy Client ID and Client Secret to `.env.local`

### 4. Database Migration
```bash
npm run prisma:push
npm run prisma:seed
```

This creates:
- Updated `users` table with Google OAuth fields
- New `signup_requests` table
- Admin user: `mohamed.hussein@qawafel.sa` / `admin`

### 5. Start Development Server
```bash
npm run dev
```

Visit: `http://localhost:3000`

## 🚀 How It Works

### For New Users (Google Sign-In)

1. User clicks "Sign in with Google"
2. Google authentication flow
3. System checks if user exists:
   - **Exists & Approved**: Login successful
   - **Exists & Pending**: Shows "Your account is pending approval"
   - **Doesn't Exist**: Creates signup request, shows "Signup request submitted"
4. Admin approves request in "User Approvals" page
5. User can now sign in successfully

### For Admins

1. Login: `mohamed.hussein@qawafel.sa` / `admin`
2. Click "User Approvals" in sidebar (admin only)
3. See pending signup requests
4. Click "Approve" or "Reject"
5. Manage existing users (block/approve)

### For Existing Users

- **Email/Password**: Use credentials login
- **Google OAuth**: Use Google sign-in if already approved

## 🎯 Features

### 1. Login Page
- Email/password authentication
- Google Sign-In button
- Error handling with user-friendly messages
- Auto-redirects after successful login

### 2. User Approvals (Admin Only)
- View pending signup requests
- Approve/reject with one click
- Manage all users
- Block/unblock user access

### 3. Settings Page
- Shows actual logged-in user data
- Update name and email
- Change password (credentials users only)
- Shows user avatar or first letter
- Different UI for Google vs credentials users

### 4. Header Component
- Displays user avatar or initial
- Shows Google profile image if available
- Logout button with NextAuth signOut

### 5. User Table
New fields:
- `email` (required, unique)
- `name` (for Google users)
- `image` (profile picture URL)
- `provider` ("credentials" or "google")
- `approved` (boolean - must be true to login)
- `password` (nullable - only for credentials)

### 6. Signup Requests Table
- `email`, `name`, `image`
- `provider`, `status` ("pending", "approved", "rejected")
- `createdAt`

## 🔐 Security Features

1. **Approval Required**: All new Google users need admin approval
2. **Session Management**: Secure JWT-based sessions
3. **Password Protection**: Only credentials users can change passwords
4. **Role-Based Access**: Admin-only pages protected
5. **HTTPS in Production**: Enforced for production environments

## 📝 Testing

### Test Credentials Login
```
Email: mohamed.hussein@qawafel.sa
Password: admin
```

### Test Google Sign-In Flow
1. Click "Sign in with Google"
2. Select/login to Google account
3. Should see "Signup request submitted" (if first time)
4. Login as admin
5. Go to "User Approvals"
6. Approve the request
7. Sign in with Google again - should work!

### Test Settings Page
1. Login with any account
2. Go to Settings
3. Update name/email
4. Changes should reflect immediately
5. Try changing password (credentials only)

### Test User Avatar
1. Login with Google - should show profile picture
2. Login with credentials - should show first letter
3. Check header and settings page

## ⚠️ Important Notes

1. **Change Admin Password**: The default password is `admin` - change it in production!
2. **NEXTAUTH_SECRET**: Must be set in production
3. **HTTPS Required**: Google OAuth requires HTTPS in production
4. **Database Seeding**: Must run `npm run prisma:seed` after deployment
5. **Environment Variables**: Set in Vercel/hosting platform

## 🐛 Troubleshooting

### "Sign in with Google" doesn't work
- ✅ Check GOOGLE_CLIENT_ID is set
- ✅ Verify redirect URI in Google Console
- ✅ Check browser console for errors
- ✅ Ensure NEXTAUTH_URL matches your domain

### "Your account is pending approval"
- ✅ This is correct! Login as admin to approve
- ✅ Check `signup_requests` table
- ✅ Go to "User Approvals" page

### Can't login as admin
- ✅ Run `npm run prisma:seed`
- ✅ Check `users` table for admin user
- ✅ Email: `mohamed.hussein@qawafel.sa`
- ✅ Password: `admin`

### Settings page doesn't show my data
- ✅ Make sure you're logged in
- ✅ Check session is active
- ✅ Try refreshing the page

### User avatar not showing
- ✅ Google users: Profile picture from Google
- ✅ Credentials users: First letter of name/email
- ✅ Check user has name field populated

## 📚 Code Structure

```
app/
├── api/
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts        # NextAuth API route
├── login/
│   └── page.tsx               # Login page with Google button
├── page.tsx                   # Main dashboard (loads user data)
└── layout.tsx                 # Root layout with SessionProvider

components/
├── ApprovalsPage.tsx          # Admin approval interface
├── Header.tsx                 # Shows user avatar/initial
├── SettingsPage.tsx           # User profile settings
├── Providers.tsx              # NextAuth SessionProvider wrapper
└── ...

lib/
├── auth.ts                    # Session management
├── authOptions.ts             # NextAuth configuration
├── adminActions.ts            # Approval system actions
├── userActions.ts             # User profile updates
└── ...

prisma/
├── schema.prisma              # Updated with OAuth fields
└── seed.ts                    # Creates admin user
```

## 🎉 You're Ready!

Everything is implemented and working:
- ✅ Google OAuth backend
- ✅ Signup request system
- ✅ Admin approval page
- ✅ User settings with real data
- ✅ User avatar display
- ✅ Phone column in leads

Just add your Google OAuth credentials and you're good to go!
