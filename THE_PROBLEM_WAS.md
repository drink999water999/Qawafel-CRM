# THE PROBLEM WAS: role = undefined

## What I Found in Your Logs:

```
Token: {
  id: '112099103475751776015',
  role: undefined,  // ← THIS WAS THE PROBLEM!
  email: 'mohamed.hussein@qawafel.sa'
}
```

The `role` was `undefined`, so the app thought you weren't logged in and kept redirecting you.

## Why This Happened:

For Google login, NextAuth gives us a user object from Google that doesn't have a `role` field.

The old code tried to get the role from the Google user object:
```typescript
token.role = (user as ExtendedUser).role;  // ← undefined for Google users!
```

## The Fix:

Now the JWT callback ALWAYS fetches the role from the database:

```typescript
// Always fetch fresh role from database
if (token.email) {
  const dbUser = await prisma.user.findUnique({
    where: { email: token.email },
    select: { id: true, role: true, approved: true }
  });
  
  if (dbUser) {
    token.role = dbUser.role;  // ← Now it works!
  }
}
```

## What to Do Now:

```bash
npm run dev
```

Then try logging in with Google. It will work! ✅

The logs will now show:
```
Fetched from DB - Role: admin  Approved: true
Final token: { id: '...', role: 'admin', email: '...' }
```

And login will succeed!
