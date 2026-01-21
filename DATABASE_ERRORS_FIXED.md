# ✅ DATABASE ERRORS FIXED

## Error 1: Seed File (Production) ✅ FIXED

**Error:**
```
Object literal may only specify known properties, and 'company' does not exist in type 'DealCreateManyInput'.
```

**Problem:**
- Seed file tried to create deals with `company` and `contactName`
- Deal model no longer has these fields (normalized to use `leadId`)

**Solution:**
Updated seed file to:
1. Query leads after creating them
2. Reference leads by `leadId` instead of storing duplicate `company/contactName`
3. Added "Farsi Supermarket" as a lead (was missing)

**Fixed Code:**
```typescript
// Get leads to reference in deals
const freshFoodsLead = await prisma.lead.findFirst({
  where: { company: 'Fresh Foods Co.' }
});
const cityMartLead = await prisma.lead.findFirst({
  where: { company: 'City Mart' }
});
const farsiLead = await prisma.lead.findFirst({
  where: { company: 'Farsi Supermarket' }
});

// Create deals with leadId
await prisma.deal.createMany({
  data: [
    {
      title: 'Expansion Deal with Fresh Foods Co.',
      leadId: freshFoodsLead?.id || null,  // ← leadId, not company/contactName
      value: 75000,
      stage: 'Discovery',
      probability: 30,
      closeDate: new Date('2024-08-30'),
    },
    // ...
  ]
});
```

---

## Error 2: Runtime Error (Dev) ✅ NEEDS MIGRATION

**Error:**
```
lib\actions.ts (8:10) @ async getCustomers
```

**Problem:**
Database schema hasn't been updated yet with the new changes.

**Solution:**
You need to push the schema changes to the database.

---

## MIGRATION STEPS (IMPORTANT):

### Step 1: Push Schema Changes
```bash
npx prisma db push
```

This will update your database with:
- Phone fields as String (not BigInt)
- Deal model with leadId (not company/contactName)
- All indexes

### Step 2: Generate Prisma Client
```bash
npx prisma generate
```

This regenerates the TypeScript types for Prisma.

### Step 3: (Optional) Reseed Database
If you want fresh data:
```bash
npx prisma db seed
```

### Step 4: Restart Dev Server
```bash
npm run dev
```

### Step 5: Test Production Build
```bash
npm run build
```

---

## What Changed in Schema:

### Before:
```prisma
model Deal {
  company String      // ❌ Removed
  contactName String  // ❌ Removed
  ...
}

model Lead {
  phone BigInt  // ❌ Changed
}
```

### After:
```prisma
model Deal {
  leadId Int?  // ✅ Added - references Lead
  lead Lead? @relation(...)
  ...
}

model Lead {
  phone String  // ✅ Changed to String
  deals Deal[]  // ✅ Added relation
}
```

---

## Full Migration Command Sequence:

```bash
# 1. Clean any generated files
rm -rf node_modules/.prisma

# 2. Push schema to database
npx prisma db push

# 3. Generate Prisma client
npx prisma generate

# 4. (Optional) Seed database
npx prisma db seed

# 5. Restart dev server
npm run dev

# 6. Test production build
npm run build
```

---

## Expected Results:

### After Migration:

✅ Database schema updated  
✅ Prisma client regenerated  
✅ Seed file works  
✅ Dev server works  
✅ Production build succeeds  

### Seed Data Created:

**Leads:**
- Modern Grocers
- Fresh Foods Co.
- City Mart
- Farsi Supermarket (newly added)

**Deals:**
- Expansion Deal → Fresh Foods Co. (via leadId)
- Initial Supply → City Mart (via leadId)
- Q3 Dates Supply → Farsi Supermarket (via leadId)

---

## Testing:

### Test Deals:
1. Go to Deals page
2. Should see 3 deals
3. Each deal shows company/contactName (from lead relation)
4. All working! ✅

### Test Phone Numbers:
1. Add customer with phone
2. Phone saves as string
3. No conversion errors! ✅

---

## If You Get Database Connection Errors:

### Check DATABASE_URL:
Make sure your `.env` file has the correct database URL:
```env
DATABASE_URL="postgresql://..."
```

### Check Database is Running:
If using local PostgreSQL:
```bash
# Check if PostgreSQL is running
pg_isready

# Or restart it
sudo service postgresql restart
```

---

## Common Issues & Solutions:

### Issue 1: "Column does not exist"
**Solution:** Run `npx prisma db push` again

### Issue 2: "Prisma Client not found"
**Solution:** Run `npx prisma generate`

### Issue 3: "Migration failed"
**Solution:** 
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Then reseed
npx prisma db seed
```

---

## Summary:

**Files Fixed:**
1. ✅ `prisma/seed.ts` - Deals use leadId, added Farsi lead

**Database Changes Needed:**
1. Push schema: `npx prisma db push`
2. Generate client: `npx prisma generate`

**After Migration:**
✅ Seed file works  
✅ No type errors  
✅ Dev works  
✅ Production builds  

---

## Quick Fix (Copy-Paste):

```bash
npx prisma db push && npx prisma generate && npm run dev
```

This single command will:
1. Push schema changes
2. Regenerate Prisma client
3. Start dev server

**Then your app will work!** 🎉
