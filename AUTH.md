# Authentication System

## Overview
The Qawafel CRM now includes a complete authentication system with login/logout functionality.

## Default Credentials
- **Username:** `admin`
- **Password:** `admin`

⚠️ **Important:** Change the default password in production!

## Features

### 1. Login System
- Secure login page at `/login`
- Session-based authentication using HTTP-only cookies
- Auto-redirect to login if not authenticated
- Password validation

### 2. User Management
Users are stored in the database with:
- Username (unique)
- Password (stored as plain text - **should be hashed in production**)
- Role (admin/user)
- Created timestamp

### 3. Route Protection
All routes except `/login` are protected and require authentication:
- Middleware checks for valid session
- Auto-redirect to login page if no session
- API routes are accessible (for future mobile app support)

### 4. Logout Functionality
- Logout button in the header (top right)
- Confirmation dialog before logging out
- Clears session and redirects to login

## Database Setup

After updating your `.env` file with `DATABASE_URL`, run:

```bash
# Push the schema (includes User model)
npm run prisma:push

# Seed the database (creates admin user)
npm run prisma:seed
```

## Adding New Users

### Option 1: Via Database (Prisma Studio)
```bash
npm run prisma:studio
```
Then add users in the `users` table.

### Option 2: Via SQL
```sql
INSERT INTO users (username, password, role, created_at)
VALUES ('john', 'password123', 'user', NOW());
```

### Option 3: Via Code (seed.ts)
Add to `prisma/seed.ts`:
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

## Login with Any User in Database

Any user record in the `users` table can login:
1. Their `username` must match
2. Their `password` must match
3. They will have a role (`admin` or `user`)

Example:
```
Username: john
Password: password123
```

## Security Notes

### ⚠️ For Production Use:
1. **Hash Passwords:** Use bcrypt or similar
2. **Environment Variables:** Store secrets properly
3. **HTTPS Only:** Enable secure cookies
4. **CSRF Protection:** Implement token validation
5. **Rate Limiting:** Prevent brute force attacks
6. **Session Expiry:** Current: 7 days (configurable)

### Current Implementation (Development Only):
- ❌ Passwords stored in plain text
- ❌ No password hashing
- ❌ No rate limiting
- ❌ No CSRF protection
- ✅ HTTP-only cookies
- ✅ Session expiration (7 days)
- ✅ Route protection
- ✅ Auto-redirect

## Password Hashing (Recommended for Production)

Install bcrypt:
```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

Update `lib/auth.ts`:
```typescript
import bcrypt from 'bcryptjs';

export async function login(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return { success: false, error: 'Invalid credentials' };
  }

  // Compare hashed password
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return { success: false, error: 'Invalid credentials' };
  }

  // ... rest of login logic
}
```

When creating users, hash the password:
```typescript
const hashedPassword = await bcrypt.hash('password123', 10);

await prisma.user.create({
  data: {
    username: 'john',
    password: hashedPassword,
    role: 'user',
  },
});
```

## Testing

1. Start the app: `npm run dev`
2. Navigate to `http://localhost:3000`
3. You'll be redirected to `/login`
4. Enter credentials:
   - Username: `admin`
   - Password: `admin`
5. Click "Login"
6. You'll be redirected to the dashboard
7. Click "Logout" in the header to test logout

## Troubleshooting

### "Invalid username or password"
- Check that you've run `npm run prisma:seed`
- Verify user exists in database: `npm run prisma:studio`

### Stuck on login page after entering correct credentials
- Clear browser cookies
- Check browser console for errors
- Verify DATABASE_URL is correct

### Can't access any page
- Check middleware.ts is in the root directory
- Verify session cookie is being set (check browser dev tools)

## API Structure

### Login Endpoint
```typescript
// lib/auth.ts
export async function login(username: string, password: string)
// Returns: { success: boolean, error?: string }
```

### Logout Endpoint
```typescript
// lib/auth.ts
export async function logout()
// Redirects to /login
```

### Get Session
```typescript
// lib/auth.ts
export async function getSession()
// Returns: { userId, username, role } | null
```

### Require Auth
```typescript
// lib/auth.ts
export async function requireAuth()
// Redirects to /login if not authenticated
// Returns session if authenticated
```

## Files Changed/Added

### New Files:
- `lib/auth.ts` - Authentication logic
- `app/login/page.tsx` - Login page component
- `middleware.ts` - Route protection
- `AUTH.md` - This documentation

### Modified Files:
- `prisma/schema.prisma` - Added User model
- `prisma/seed.ts` - Added admin user seed
- `app/page.tsx` - Added requireAuth()
- `components/Header.tsx` - Added logout button

## Next Steps

For production deployment:
1. Implement password hashing (bcrypt)
2. Add HTTPS enforcement
3. Implement rate limiting
4. Add CSRF protection
5. Add 2FA (optional)
6. Implement password reset flow
7. Add email verification
8. Implement role-based access control (RBAC)
9. Add audit logging
10. Implement session management dashboard
