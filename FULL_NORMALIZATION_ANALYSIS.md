# COMPLETE CRM NORMALIZATION PLAN

## Current Denormalized Fields Analysis

Let me analyze EVERYTHING that can be normalized:

### 1. DEALS - High Priority ✅
**Current:**
- stage: String ("New", "Discovery", "Proposal", "Negotiation", "Closed Won", "Lost")

**Should be:**
- DealStage table with:
  - id, name, color, order, isActive, isClosed

**Benefits:**
- Define stage workflow/order
- Add colors for UI
- Track which stages are "won" vs "lost"
- Analytics by stage

---

### 2. LEADS - High Priority ✅
**Current:**
- status: String ("New", "Contacted", "Qualified", "Proposal", "Negotiation", "Closed Won", "Lost")
- source: String ("Website", "Referral", "Cold Call", "Trade Show", "Partner")

**Should be:**
- LeadStatus table
- LeadSource table

**Benefits:**
- Track source performance
- Define lead lifecycle
- Source-based analytics
- Conversion tracking

---

### 3. MERCHANTS - High Priority ✅
**Current:**
- plan: String ("Monthly", "Quarterly", "Yearly", "Trail")
- category: String (business categories)
- retentionStatus: String ("Active", "Retained", "Ressurected", "Dormant", "Churned")

**Should be:**
- Plan table (with pricing, features, billing cycle)
- Category table
- RetentionStatus table

**Benefits:**
- Plan details (price, features, limits)
- Structured business categories
- Retention lifecycle management

---

### 4. CUSTOMERS & MERCHANTS - Medium Priority ✅
**Current:**
- accountStatus: String ("Active", "Inactive", "Suspended", "Deactivated")
- marketplaceStatus: String (for Customers)

**Should be:**
- AccountStatus table (shared)
- MarketplaceStatus table

**Benefits:**
- Consistent statuses across entities
- Add status metadata (color, permissions)
- Workflow rules

---

### 5. PROPOSALS - Medium Priority ✅
**Current:**
- status: String
- currency: String ("SAR", "USD", etc.)

**Should be:**
- ProposalStatus table
- Currency table

**Benefits:**
- Proposal workflow
- Multi-currency support with rates

---

### 6. NOTES - Already Good ✅
**Current:**
- entityType: String (we just added this)

**Keep as is:**
- Only 3 values, rarely changes
- Polymorphic relation helper

---

## Recommended Normalization Structure

### HIGH PRIORITY (Do These):

```prisma
// Deal stages with workflow
model DealStage {
  id          Int     @id @default(autoincrement())
  name        String  @unique
  description String?
  color       String  // hex color for UI
  order       Int     // workflow order
  isWon       Boolean @default(false)
  isLost      Boolean @default(false)
  isActive    Boolean @default(true)
  
  deals Deal[]
  
  @@map("deal_stages")
}

// Lead statuses
model LeadStatus {
  id          Int     @id @default(autoincrement())
  name        String  @unique
  description String?
  color       String
  order       Int
  isActive    Boolean @default(true)
  
  leads Lead[]
  
  @@map("lead_statuses")
}

// Lead sources for analytics
model LeadSource {
  id          Int     @id @default(autoincrement())
  name        String  @unique
  description String?
  isActive    Boolean @default(true)
  
  leads Lead[]
  
  @@map("lead_sources")
}

// Merchant plans with pricing
model Plan {
  id            Int     @id @default(autoincrement())
  name          String  @unique
  description   String?
  price         Decimal @db.Decimal(10, 2)
  billingCycle  String  // "monthly", "quarterly", "yearly"
  features      String? @db.Text // JSON or comma-separated
  isActive      Boolean @default(true)
  
  merchants Merchant[]
  
  @@map("plans")
}

// Business categories
model Category {
  id          Int     @id @default(autoincrement())
  name        String  @unique
  description String?
  isActive    Boolean @default(true)
  
  merchants Merchant[]
  
  @@map("categories")
}

// Retention lifecycle
model RetentionStatus {
  id          Int     @id @default(autoincrement())
  name        String  @unique
  description String?
  color       String
  order       Int
  isActive    Boolean @default(true)
  
  merchants Merchant[]
  
  @@map("retention_statuses")
}

// Account statuses (shared)
model AccountStatus {
  id          Int     @id @default(autoincrement())
  name        String  @unique
  description String?
  color       String
  allowsLogin Boolean @default(true)
  isActive    Boolean @default(true)
  
  customers Customer[]
  merchants Merchant[]
  
  @@map("account_statuses")
}

// Marketplace statuses
model MarketplaceStatus {
  id          Int     @id @default(autoincrement())
  name        String  @unique
  description String?
  color       String
  isActive    Boolean @default(true)
  
  customers Customer[]
  
  @@map("marketplace_statuses")
}

// Proposal statuses
model ProposalStatus {
  id          Int     @id @default(autoincrement())
  name        String  @unique
  description String?
  color       String
  order       Int
  isActive    Boolean @default(true)
  
  proposals Proposal[]
  
  @@map("proposal_statuses")
}

// Currencies with exchange rates
model Currency {
  id           Int     @id @default(autoincrement())
  code         String  @unique // "SAR", "USD"
  name         String  // "Saudi Riyal"
  symbol       String  // "﷼"
  exchangeRate Decimal @db.Decimal(10, 4) // to base currency
  isDefault    Boolean @default(false)
  isActive     Boolean @default(true)
  
  proposals Proposal[]
  
  @@map("currencies")
}
```

### Updated Entity Models:

```prisma
model Deal {
  id          Int      @id @default(autoincrement())
  title       String
  companyId   Int      @map("company_id")
  contactId   Int      @map("contact_id")
  stageId     Int      @map("stage_id")  // ← FK instead of string
  value       Decimal  @db.Decimal(10, 2)
  probability Int
  closeDate   DateTime @map("close_date") @db.Date
  createdAt   DateTime @default(now()) @map("created_at")
  
  company Company   @relation(...)
  contact Contact   @relation(...)
  stage   DealStage @relation(fields: [stageId], references: [id])  // ← New
  
  @@index([stageId])
}

model Lead {
  id               Int      @id @default(autoincrement())
  company          String
  contactName      String   @map("contact_name")
  email            String
  phone            BigInt
  statusId         Int      @map("status_id")  // ← FK
  sourceId         Int      @map("source_id")  // ← FK
  value            Decimal  @db.Decimal(10, 2)
  businessSize     String?
  numberOfBranches Int?
  formToken        String?  @unique
  
  status LeadStatus @relation(fields: [statusId], references: [id])
  source LeadSource @relation(fields: [sourceId], references: [id])
  notes  Note[]
  
  @@index([statusId])
  @@index([sourceId])
}

model Merchant {
  id                Int       @id @default(autoincrement())
  name              String
  email             String    @unique
  phone             BigInt?
  accountStatusId   Int       @map("account_status_id")  // ← FK
  joinDate          DateTime  @map("join_date") @db.Date
  businessName      String
  categoryId        Int       @map("category_id")  // ← FK
  
  // Subscription
  planId            Int?      @map("plan_id")  // ← FK
  signUpDate        DateTime? @db.Date
  trialFlag         Boolean   @default(false)
  saasStartDate     DateTime? @db.Date
  saasEndDate       DateTime? @db.Date
  
  // CR, VAT, ZATCA fields...
  
  retentionStatusId Int?      @map("retention_status_id")  // ← FK
  lastPaymentDueDate DateTime? @db.Date
  
  accountStatus   AccountStatus    @relation(...)
  category        Category         @relation(...)
  plan            Plan?            @relation(...)
  retentionStatus RetentionStatus? @relation(...)
  
  @@index([accountStatusId])
  @@index([categoryId])
  @@index([planId])
  @@index([retentionStatusId])
}

model Customer {
  id                  Int      @id @default(autoincrement())
  name                String
  email               String   @unique
  phone               BigInt?
  accountStatusId     Int      @map("account_status_id")     // ← FK
  marketplaceStatusId Int      @map("marketplace_status_id") // ← FK
  joinDate            DateTime @db.Date
  company             String
  
  accountStatus     AccountStatus     @relation(...)
  marketplaceStatus MarketplaceStatus @relation(...)
  
  @@index([accountStatusId])
  @@index([marketplaceStatusId])
}

model Proposal {
  id             Int      @id @default(autoincrement())
  title          String
  clientName     String
  clientCompany  String
  value          Decimal  @db.Decimal(10, 2)
  currencyId     Int      @map("currency_id")  // ← FK
  statusId       Int      @map("status_id")    // ← FK
  validUntil     DateTime @db.Date
  sentDate       DateTime? @db.Date
  createdAt      DateTime @db.Date
  
  currency Currency        @relation(...)
  status   ProposalStatus  @relation(...)
  
  @@index([currencyId])
  @@index([statusId])
}
```

---

## Benefits of Full Normalization

### 1. Data Integrity
✅ No typos ("Montly" vs "Monthly")
✅ Consistent values across system
✅ Cascade updates (change "Monthly" → affects all merchants)

### 2. Rich Metadata
✅ Colors for each status (UI consistency)
✅ Descriptions (tooltips, help)
✅ Order (workflow, sorting)
✅ Flags (isActive, isWon, isLost)

### 3. Better Analytics
✅ Group by status/source/stage
✅ Conversion rates by source
✅ Revenue by plan
✅ Stage velocity metrics

### 4. Flexibility
✅ Add new statuses without code changes
✅ Deactivate old statuses
✅ Multi-language support (add name_ar field)
✅ Pricing changes (plan table)

### 5. Admin Panel Possibilities
✅ Manage stages via UI
✅ Manage plans/pricing
✅ Customize workflows
✅ Add new sources/categories

---

## What This Means for Code

### Before (Current):
```typescript
// Create deal
await prisma.deal.create({
  data: {
    stage: "Proposal"  // Just a string
  }
});

// Filter
const deals = await prisma.deal.findMany({
  where: { stage: "Proposal" }
});
```

### After (Normalized):
```typescript
// Create deal
const proposalStage = await prisma.dealStage.findFirst({
  where: { name: "Proposal" }
});

await prisma.deal.create({
  data: {
    stageId: proposalStage.id
  }
});

// Filter with metadata
const deals = await prisma.deal.findMany({
  where: { stageId: proposalStage.id },
  include: {
    stage: true  // Get color, order, etc.
  }
});

// Display
deals.map(deal => (
  <span style={{ color: deal.stage.color }}>
    {deal.stage.name}
  </span>
));
```

---

## Migration Complexity

### Easy (Recommended First):
1. ✅ DealStage - Single entity
2. ✅ LeadStatus - Single entity
3. ✅ LeadSource - Single entity
4. ✅ Category - Single entity

### Medium:
5. ✅ Plan - May need pricing data
6. ✅ Currency - Need exchange rates
7. ✅ RetentionStatus - Single entity

### Complex (Do Last):
8. ✅ AccountStatus - Used by 2 entities
9. ✅ MarketplaceStatus - Used by 1 entity
10. ✅ ProposalStatus - Single entity

---

## My Recommendation

### Phase 1 (Do Now):
```
✅ Company (already planned)
✅ Contact (already planned)
✅ DealStage
✅ LeadStatus
✅ LeadSource
✅ Phone → BigInt (already planned)
```

### Phase 2 (Next):
```
✅ Category
✅ Plan
✅ RetentionStatus
```

### Phase 3 (Later):
```
✅ AccountStatus
✅ MarketplaceStatus
✅ ProposalStatus
✅ Currency
```

---

## What Do You Think?

**Option A: Full Normalization (All phases)**
- Most benefits
- Most work
- Best long-term

**Option B: Phase 1 Only**
- Quick wins
- Less work
- Can add more later

**Option C: Custom Selection**
- Pick which tables you want
- Mix and match

**Which approach do you prefer?** 🤔
