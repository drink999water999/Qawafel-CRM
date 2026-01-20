# FIX GOOGLE OAUTH - redirect_uri_mismatch Error

## The Error You're Getting:

```
Error 400: redirect_uri_mismatch
```

This means the redirect URI in your Google Console doesn't match what NextAuth is using.

---

## SOLUTION - Add This Exact URI to Google Console:

### For Local Development:
```
http://localhost:3000/api/auth/callback/google
```

### For Production (when deployed):
```
https://yourdomain.com/api/auth/callback/google
```

---

## How to Fix in Google Console:

### Step 1: Go to Google Cloud Console
https://console.cloud.google.com/

### Step 2: Select Your Project

### Step 3: Go to "APIs & Services" → "Credentials"

### Step 4: Click on Your OAuth 2.0 Client ID

### Step 5: Under "Authorized redirect URIs", ADD:
```
http://localhost:3000/api/auth/callback/google
```

**IMPORTANT:** 
- Must be EXACT (no trailing slash)
- Must include the full path `/api/auth/callback/google`
- For local: use `http://localhost:3000`
- For production: use `https://yourdomain.com`

### Step 6: Click "SAVE"

### Step 7: Restart Your Dev Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## Test It:

1. Go to http://localhost:3000/login
2. Click "Sign in with Google"
3. Should open Google login popup
4. Choose your account
5. Should redirect back successfully

---

## Your .env.local Should Have:

```env
DATABASE_URL="your_database_url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_secret"
GOOGLE_CLIENT_ID="your_client_id_from_google"
GOOGLE_CLIENT_SECRET="your_client_secret_from_google"
```

---

## Common Mistakes:

❌ **Wrong:**
- `http://localhost:3000/` (trailing slash)
- `http://localhost:3000/api/auth/callback` (missing /google)
- `https://localhost:3000/...` (using https for localhost)

✅ **Correct:**
- `http://localhost:3000/api/auth/callback/google`

---

## If Still Getting Error:

1. **Double-check the URI in Google Console** - Must be EXACT
2. **Make sure you clicked SAVE** in Google Console
3. **Restart dev server** after changing Google Console
4. **Clear browser cache** and try again
5. **Check .env.local** has correct GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET

---

## Screenshot of What to Do:

In Google Console, under your OAuth client:

```
Authorized redirect URIs:
┌─────────────────────────────────────────────────────┐
│ http://localhost:3000/api/auth/callback/google     │
│                                                 [X] │
├─────────────────────────────────────────────────────┤
│ [+ ADD URI]                                         │
└─────────────────────────────────────────────────────┘
```

Then click **SAVE** at the bottom.

---

## After Fixing:

- ✅ Google login should work
- ✅ New users create signup requests
- ✅ Existing approved users can login
- ✅ Email/password still works too
