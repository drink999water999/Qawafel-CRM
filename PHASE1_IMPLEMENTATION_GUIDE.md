# PHASE 1 IMPLEMENTATION - COMPLETE GUIDE

## ✅ Schema Changes DONE

### New Tables Created:
1. **companies** - Normalized company names
2. **contacts** - Contact information with company FK
3. **deal_stages** - Deal stage lookup table
4. **lead_statuses** - Lead status lookup table
5. **lead_sources** - Lead source lookup table

### Modified Tables:
6. **deals** - Now references company_id, contact_id, stage_id
7. **leads** - Now references status_id, source_id, phone is BigInt
8. **customers** - phone is BigInt
9. **merchants** - phone is BigInt
10. **user_profile** - phone is BigInt
11. **notes** - added entity_type field

---

## Code Changes Required

### Priority 1: Create Lookup Tables Seed Data

**File: prisma/seed.ts**

Need to create:
```typescript
// 1. Deal Stages
const stages = await prisma.dealStage.createMany({
  data: [
    { name: 'New', order: 1, color: '#6B7280' },
    { name: 'Discovery', order: 2, color: '#3B82F6' },
    { name: 'Proposal', order: 3, color: '#8B5CF6' },
    { name: 'Negotiation', order: 4, color: '#F59E0B' },
    { name: 'Closed Won', order: 5, color: '#10B981', isWon: true },
    { name: 'Lost', order: 6, color: '#EF4444', isLost: true },
  ]
});

// 2. Lead Statuses
const statuses = await prisma.leadStatus.createMany({
  data: [
    { name: 'New', order: 1, color: '#6B7280' },
    { name: 'Contacted', order: 2, color: '#3B82F6' },
    { name: 'Qualified', order: 3, color: '#8B5CF6' },
    { name: 'Proposal', order: 4, color: '#F59E0B' },
    { name: 'Negotiation', order: 5, color: '#FBBF24' },
    { name: 'Closed Won', order: 6, color: '#10B981' },
    { name: 'Lost', order: 7, color: '#EF4444' },
  ]
});

// 3. Lead Sources
const sources = await prisma.leadSource.createMany({
  data: [
    { name: 'Website' },
    { name: 'Referral' },
    { name: 'Cold Call' },
    { name: 'Trade Show' },
    { name: 'Partner' },
    { name: 'Social Media' },
    { name: 'Email Campaign' },
  ]
});
```

---

### Priority 2: Deal Actions

**File: lib/actions.ts**

#### getDeals() - Needs to include relations
```typescript
export async function getDeals() {
  return await prisma.deal.findMany({
    include: {
      company: true,
      contact: true,
      stage: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}
```

#### createDeal() - Find or create company/contact, lookup stage
```typescript
export async function createDeal(data: {
  title: string;
  company: string;        // company name
  contactName: string;    // contact name
  contactEmail?: string;
  contactPhone?: string;  // Will be converted to BigInt
  stage: string;          // stage name
  value: number;
  probability: number;
  closeDate: Date;
}) {
  // 1. Find or create company
  let company = await prisma.company.findFirst({
    where: { name: data.company }
  });
  
  if (!company) {
    company = await prisma.company.create({
      data: { name: data.company }
    });
  }
  
  // 2. Find or create contact
  let contact = await prisma.contact.findFirst({
    where: {
      name: data.contactName,
      companyId: company.id
    }
  });
  
  if (!contact) {
    contact = await prisma.contact.create({
      data: {
        name: data.contactName,
        email: data.contactEmail,
        phone: data.contactPhone ? BigInt(data.contactPhone) : null,
        companyId: company.id
      }
    });
  }
  
  // 3. Find stage
  const stage = await prisma.dealStage.findFirst({
    where: { name: data.stage }
  });
  
  if (!stage) {
    throw new Error(`Invalid stage: ${data.stage}`);
  }
  
  // 4. Create deal
  const deal = await prisma.deal.create({
    data: {
      title: data.title,
      companyId: company.id,
      contactId: contact.id,
      stageId: stage.id,
      value: data.value,
      probability: data.probability,
      closeDate: data.closeDate,
    },
    include: {
      company: true,
      contact: true,
      stage: true,
    }
  });
  
  revalidatePath('/');
  return deal;
}
```

#### updateDeal() - Similar logic
```typescript
export async function updateDeal(
  id: number,
  data: {
    title?: string;
    company?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    stage?: string;
    value?: number;
    probability?: number;
    closeDate?: Date;
  }
) {
  const updateData: any = {};
  
  if (data.title) updateData.title = data.title;
  if (data.value !== undefined) updateData.value = data.value;
  if (data.probability !== undefined) updateData.probability = data.probability;
  if (data.closeDate) updateData.closeDate = data.closeDate;
  
  // Handle company/contact if provided
  if (data.company || data.contactName) {
    // Same logic as createDeal for company/contact
    // ...
  }
  
  // Handle stage if provided
  if (data.stage) {
    const stage = await prisma.dealStage.findFirst({
      where: { name: data.stage }
    });
    if (stage) {
      updateData.stageId = stage.id;
    }
  }
  
  const deal = await prisma.deal.update({
    where: { id },
    data: updateData,
    include: {
      company: true,
      contact: true,
      stage: true,
    }
  });
  
  revalidatePath('/');
  return deal;
}
```

#### Get all stages helper
```typescript
export async function getDealStages() {
  return await prisma.dealStage.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });
}
```

---

### Priority 3: Lead Actions

**File: lib/actions.ts**

#### getLeads() - Needs to include relations
```typescript
export async function getLeads() {
  return await prisma.lead.findMany({
    include: {
      status: true,
      source: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}
```

#### createLead() - Lookup status/source
```typescript
export async function createLead(data: {
  company: string;
  contactName: string;
  email: string;
  phone: string;        // Will convert to BigInt
  status: string;       // status name
  source: string;       // source name
  value: number;
  businessSize?: string;
  numberOfBranches?: number;
  formToken?: string;
}) {
  // Find status
  const status = await prisma.leadStatus.findFirst({
    where: { name: data.status }
  });
  if (!status) throw new Error(`Invalid status: ${data.status}`);
  
  // Find source
  const source = await prisma.leadSource.findFirst({
    where: { name: data.source }
  });
  if (!source) throw new Error(`Invalid source: ${data.source}`);
  
  const lead = await prisma.lead.create({
    data: {
      company: data.company,
      contactName: data.contactName,
      email: data.email,
      phone: BigInt(data.phone),
      statusId: status.id,
      sourceId: source.id,
      value: data.value,
      businessSize: data.businessSize,
      numberOfBranches: data.numberOfBranches,
      formToken: data.formToken,
    },
    include: {
      status: true,
      source: true,
    }
  });
  
  revalidatePath('/');
  return lead;
}
```

#### updateLead() - Similar logic
```typescript
export async function updateLead(
  id: number,
  data: {
    company?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    status?: string;
    source?: string;
    value?: number;
    businessSize?: string;
    numberOfBranches?: number;
    formToken?: string;
  }
) {
  const updateData: any = {};
  
  if (data.company) updateData.company = data.company;
  if (data.contactName) updateData.contactName = data.contactName;
  if (data.email) updateData.email = data.email;
  if (data.phone) updateData.phone = BigInt(data.phone);
  if (data.value !== undefined) updateData.value = data.value;
  if (data.businessSize) updateData.businessSize = data.businessSize;
  if (data.numberOfBranches !== undefined) updateData.numberOfBranches = data.numberOfBranches;
  if (data.formToken) updateData.formToken = data.formToken;
  
  // Handle status if provided
  if (data.status) {
    const status = await prisma.leadStatus.findFirst({
      where: { name: data.status }
    });
    if (status) updateData.statusId = status.id;
  }
  
  // Handle source if provided
  if (data.source) {
    const source = await prisma.leadSource.findFirst({
      where: { name: data.source }
    });
    if (source) updateData.sourceId = source.id;
  }
  
  const lead = await prisma.lead.update({
    where: { id },
    data: updateData,
    include: {
      status: true,
      source: true,
    }
  });
  
  revalidatePath('/');
  return lead;
}
```

#### Get statuses/sources helpers
```typescript
export async function getLeadStatuses() {
  return await prisma.leadStatus.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });
}

export async function getLeadSources() {
  return await prisma.leadSource.findMany({
    where: { isActive: true }
  });
}
```

---

### Priority 4: Customer/Merchant Phone Actions

**File: lib/actions.ts**

All Customer/Merchant actions already handle phone correctly since we just need to pass BigInt directly (no conversion needed anymore).

#### Customer actions - Remove any toString() calls
```typescript
// getCustomers - no changes needed
export async function getCustomers() {
  return await prisma.customer.findMany({
    orderBy: { id: 'asc' },
  });
}

// createCustomer - phone is already handled correctly
export async function createCustomer(data: {
  ...
  phone?: string;
  ...
}) {
  const customer = await prisma.customer.create({
    data: {
      ...data,
      phone: data.phone ? BigInt(data.phone) : null,
      joinDate: new Date(),
    },
  });
  revalidatePath('/');
  return customer;
}

// updateCustomer - similar
```

#### Merchant actions - Same approach
```typescript
// Already correct - just ensure BigInt conversion
```

---

### Priority 5: Note Actions

**File: lib/noteActions.ts**

#### Add entityType to createNote
```typescript
export async function createNote({
  content,
  userId,
  userName,
  leadId,
  customerId,
  merchantId,
}: {
  content: string;
  userId: string;
  userName: string;
  leadId?: number;
  customerId?: number;
  merchantId?: number;
}) {
  // Determine entity type
  let entityType = 'lead';
  if (customerId) entityType = 'customer';
  if (merchantId) entityType = 'merchant';
  
  const note = await prisma.note.create({
    data: {
      content,
      userId,
      userName,
      entityType,  // NEW
      leadId,
      customerId,
      merchantId,
    },
  });
  
  revalidatePath('/');
  return note;
}
```

---

### Priority 6: Component Updates

#### DealsPage.tsx
```typescript
interface Deal {
  id: number;
  title: string;
  company: { id: number; name: string };     // NEW - nested object
  contact: {                                  // NEW - nested object
    id: number;
    name: string;
    email?: string;
    phone?: bigint;
  };
  stage: {                                    // NEW - nested object
    id: number;
    name: string;
    color: string;
    order: number;
    isWon: boolean;
    isLost: boolean;
  };
  value: number | { toNumber?: () => number };
  probability: number;
  closeDate: string | Date;
  createdAt: string | Date;
}

// In form, need to pass stage name
const [formData, setFormData] = useState({
  title: '',
  company: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  value: 0,
  stage: 'New',  // stage name
  probability: 50,
  closeDate: new Date().toISO String().split('T')[0],
});

// In handleSubmit
await createDeal({
  ...formData,
  value: Number(formData.value),
  closeDate: new Date(formData.closeDate)
});

// Display stage with color
<div className="kanban-board">
  {STAGES.map(stageName => (
    <div key={stageName}>
      <h3>{stageName}</h3>
      {deals.filter(d => d.stage.name === stageName).map(deal => (
        <div style={{ borderLeft: `4px solid ${deal.stage.color}` }}>
          <h4>{deal.title}</h4>
          <p>{deal.company.name}</p>
          <p>{deal.contact.name}</p>
        </div>
      ))}
    </div>
  ))}
</div>
```

#### LeadsPage.tsx
```typescript
interface Lead {
  id: number;
  company: string;
  contactName: string;
  email: string;
  phone: bigint;              // BigInt
  status: {                   // NEW - nested object
    id: number;
    name: string;
    color: string;
    order: number;
  };
  source: {                   // NEW - nested object
    id: number;
    name: string;
  };
  value: number | { toNumber?: () => number };
  businessSize?: string;
  numberOfBranches?: number;
  formToken?: string;
  createdAt: string | Date;
}

// Display
<td>{lead.status.name}</td>
<td style={{ color: lead.status.color }}>{lead.status.name}</td>
<td>{lead.source.name}</td>
<td>{lead.phone.toString()}</td>  // Convert for display

// Search by phone
const searchPhone = BigInt(searchTerm);
filteredLeads = leads.filter(l => l.phone === searchPhone);
```

#### CustomersPage.tsx & MerchantsPage.tsx
```typescript
// Phone display
<td>{customer.phone?.toString() || '-'}</td>

// Phone input - type="number" or text (for BigInt)
<input 
  type="text" 
  value={formData.phone} 
  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
  placeholder="Phone (numbers only)"
  pattern="[0-9]+"
/>

// Search by phone
if (searchTerm && /^\d+$/.test(searchTerm)) {
  const searchPhone = BigInt(searchTerm);
  filteredCustomers = customers.filter(c => c.phone === searchPhone);
}
```

---

## Migration Steps

### Step 1: Push Schema
```bash
npx prisma db push --accept-data-loss
```
**Warning:** This will drop company, contactName from deals and status, source from leads!

### Step 2: Generate Client
```bash
npx prisma generate
```

### Step 3: Seed Lookup Tables
```bash
npx prisma db seed
```

### Step 4: Manual Data Migration (if you have existing data)
```sql
-- You'll need to migrate existing deals/leads to new structure
-- Or start fresh
```

### Step 5: Test Each Component
1. Test Deals page
2. Test Leads page  
3. Test Customers page
4. Test Merchants page
5. Test Notes

---

## Testing Checklist

### Deals:
- [ ] Can create deal with company/contact
- [ ] Can update deal
- [ ] Can change stage
- [ ] Stages display with colors
- [ ] Company/contact info shows correctly

### Leads:
- [ ] Can create lead
- [ ] Can update lead  
- [ ] Status/source dropdowns work
- [ ] Phone saves as BigInt
- [ ] Can search by phone number

### Customers/Merchants:
- [ ] Phone saves as BigInt
- [ ] Phone displays correctly
- [ ] Can search by phone

### Notes:
- [ ] Notes save with entityType
- [ ] Notes display correctly

---

## Files to Update Summary

1. ✅ prisma/schema.prisma - DONE
2. ⏳ prisma/seed.ts - Update with lookup tables
3. ⏳ lib/actions.ts - Deal CRUD, Lead CRUD, phone handling
4. ⏳ lib/noteActions.ts - Add entityType
5. ⏳ components/DealsPage.tsx - Handle relations
6. ⏳ components/LeadsPage.tsx - Handle relations, BigInt phone
7. ⏳ components/CustomersPage.tsx - BigInt phone
8. ⏳ components/MerchantsPage.tsx - BigInt phone
9. ⏳ components/CRMDashboard.tsx - Update interfaces

**Ready to proceed with code updates?**
