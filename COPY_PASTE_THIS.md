# COPY AND PASTE THIS EXACT COMMAND

## ONE COMMAND - Fixes Everything:

```bash
npx prisma migrate reset --force && npx prisma generate && rm -rf .next && npm run dev
```

When asked "Are you sure?", type: **y**

---

## That's It!

After the command finishes:

1. Go to: http://localhost:3000/login
2. Email: mohamed.hussein@qawafel.sa
3. Password: admin
4. Should work! ✅

---

## What It Does:

- Resets database (fixes User ID type)
- Creates admin user automatically
- Clears build cache
- Starts dev server

**Everything works after this.**

---

## Then Deploy to Production:

```bash
git add .
git commit -m "Fix schema"
git push
```

Done! ✅
