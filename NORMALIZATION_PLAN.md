# DATABASE NORMALIZATION & BIGINT PHONE - COMPLETE PLAN

## Summary of Changes

### 1. Phone Numbers → BigInt (All Models)
- Customer.phone: String? → BigInt?
- Merchant.phone: String? → BigInt?
- Lead.phone: String → BigInt
- UserProfile.phone: String → BigInt

**No formatting, no dashes, just raw numbers!**

### 2. Deals Table - NORMALIZED
**Before (Denormalized):**
```
Deal {
  company: String      // Duplicate data
  contactName: String  // Duplicate data
}
```

**After (Normalized - 3NF):**
```
Company {
  id: Int
  name: String (unique)
}

Contact {
  id: Int
  name: String
  email: String?
  phone: BigInt?
  companyId: Int      // FK to Company
}

Deal {
  id: Int
  companyId: Int      // FK to Company
  contactId: Int      // FK to Contact
  // No more duplicate data!
}
```

### 3. Notes Table - IMPROVED
Added `entityType` field for clarity:
```
Note {
  entityType: String  // "lead", "customer", "merchant"
  leadId: Int?
  customerId: Int?
  merchantId: Int?
}
```

---

## Database Schema Changes

###  New Tables Created:

1. **companies** table
   - id (PK)
   - name (unique)
   - created_at

2. **contacts** table
   - id (PK)
   - name
   - email
   - phone (BigInt)
   - company_id (FK)
   - created_at

### Modified Tables:

3. **deals** table
   - Removed: company, contact_name
   - Added: company_id (FK), contact_id (FK), created_at

4. **notes** table
   - Added: entity_type

5. **customers** table
   - phone: String? → BigInt?

6. **merchants** table
   - phone: String? → BigInt?

7. **leads** table
   - phone: String → BigInt

8. **user_profile** table
   - phone: String → BigInt

---

## Indexes Added for Performance

**Phone indexes:**
- customers.phone
- merchants.phone
- leads.phone
- contacts.phone

**Deal-related indexes:**
- companies.name
- contacts.company_id
- contacts.email
- contacts.phone
- contacts.name
- deals.company_id
- deals.contact_id
- deals.created_at

**Note indexes:**
- notes.entity_type

---

## Code Changes Required

### 1. Deal Actions (lib/actions.ts)

**createDeal():**
```typescript
// Old way:
createDeal({
  company: "ABC Corp",
  contactName: "John Doe"
})

// New way:
1. Find or create Company
2. Find or create Contact
3. Create Deal with IDs
```

**getDeal():**
```typescript
// Need to include relations:
prisma.deal.findMany({
  include: {
    company: true,
    contact: true
  }
})
```

### 2. Note Actions (lib/noteActions.ts)

**createNote():**
```typescript
// Add entityType:
{
  content: "...",
  leadId: 1,
  entityType: "lead"  // NEW
}
```

### 3. Phone Handling

**All actions:**
- Remove BigInt() conversions
- Remove toString() conversions
- Pass BigInt directly

**Components:**
- Input: type="number" or type="tel"
- Display: {phone} (no formatting)
- Search: Direct number matching

---

## Migration Strategy

### Step 1: Schema Migration
```bash
npx prisma db push
npx prisma generate
```

### Step 2: Data Migration
Need to migrate existing deals:
```sql
-- 1. Create companies from existing deals
INSERT INTO companies (name)
SELECT DISTINCT company FROM deals;

-- 2. Create contacts from existing deals
INSERT INTO contacts (name, company_id)
SELECT DISTINCT 
  d.contact_name,
  c.id
FROM deals d
JOIN companies c ON c.name = d.company;

-- 3. Update deals with FKs
UPDATE deals d
SET 
  company_id = c.id,
  contact_id = ct.id
FROM companies c
JOIN contacts ct ON ct.company_id = c.id
WHERE d.company = c.name
AND d.contact_name = ct.name;

-- 4. Drop old columns
ALTER TABLE deals DROP COLUMN company;
ALTER TABLE deals DROP COLUMN contact_name;
```

### Step 3: Update Code
1. Update Deal actions
2. Update Note actions  
3. Update all phone handling
4. Update components
5. Update seed file

### Step 4: Testing
- Test deal creation
- Test deal editing
- Test phone number search
- Test notes with entityType

---

## Benefits of Normalization

### 1. Data Integrity
- No duplicate company names
- Contact info consistent
- Easier to update company/contact data

### 2. Performance
- Smaller deal table
- Indexed lookups
- Efficient joins

### 3. Flexibility
- Easy to add company-level fields
- Easy to add contact-level fields
- Track contact history across deals

### 4. Phone as BigInt
- No formatting issues
- Direct numeric search
- Consistent storage
- Supports any length

---

## Breaking Changes

### DealsPage Component
**Old:**
```typescript
{
  company: "ABC Corp",
  contactName: "John Doe"
}
```

**New:**
```typescript
{
  company: { id: 1, name: "ABC Corp" },
  contact: { id: 1, name: "John Doe", email: "...", phone: BigInt }
}
```

### Phone Display
**Old:**
```typescript
{merchant.phone || '-'}
```

**New:**
```typescript
{merchant.phone?.toString() || '-'}
// Or just: {merchant.phone || '-'}
```

---

## File Update Checklist

- [ ] prisma/schema.prisma ✅ DONE
- [ ] lib/actions.ts - Deal functions
- [ ] lib/actions.ts - Phone handling (all models)
- [ ] lib/noteActions.ts - Add entityType
- [ ] components/DealsPage.tsx - Use Company/Contact
- [ ] components/CRMDashboard.tsx - Update Deal interface
- [ ] components/LeadsPage.tsx - Phone BigInt
- [ ] components/CustomersPage.tsx - Phone BigInt
- [ ] components/MerchantsPage.tsx - Phone BigInt
- [ ] prisma/seed.ts - New structure

---

## Next Steps

1. Review this plan
2. Confirm approach
3. Update code files one by one
4. Create migration script
5. Test thoroughly
6. Deploy

**Waiting for your approval to proceed!**
