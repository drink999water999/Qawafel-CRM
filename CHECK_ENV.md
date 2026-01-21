# CHECK YOUR .env.local FILE

## CRITICAL: Make sure you have .env.local file with these variables:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="any-random-string-here"
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-secret"
```

## Check if file exists:

```bash
ls -la .env.local
```

If file doesn't exist, create it:

```bash
cp .env.example .env.local
```

Then edit it with your database URL.

## NEXTAUTH_SECRET is REQUIRED

If NEXTAUTH_SECRET is missing or empty, auth won't work.

Set it to ANYTHING for testing:

```env
NEXTAUTH_SECRET="test-secret-123"
```

## After fixing .env.local:

```bash
npm run dev
```

Try login again.
