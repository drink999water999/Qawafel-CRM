# Adding Notes System and New Merchant Fields

## ✅ What I've Added:

### 1. Notes System
- Created `Note` model in database
- Notes can be added to Leads, Customers, and Merchants
- Each note tracks:
  - Content (the note text)
  - Date and time (automatic)
  - User who added it (automatic)
- Created reusable `Notes` component
- Created note actions (add, get, delete)

### 2. New Merchant Fields
- **Subscription fields:** plan, signUpDate, trialFlag, saasStartDate, saasEndDate
- **CR (Commercial Registration):** crId, crCertificate
- **VAT:** vatId, vatCertificate
- **ZATCA (Zakat, Tax and Customs Authority):** zatcaIdentificationType, zatcaId, verificationStatus
- **Payment:** lastPaymentDueDate, retentionStatus

---

## 🔧 Setup Steps:

### Step 1: Run Database Migration

```bash
npx prisma db push
```

This will add:
- All new merchant fields
- Notes table
- Relations between notes and leads/customers/merchants

### Step 2: Restart Dev Server

```bash
npm run dev
```

---

## 📝 Using the Notes Component:

### In Leads Page:
Add this to your lead details modal/page:

```tsx
import Notes from '@/components/Notes';

// Inside your component:
<Notes 
  entityType="lead" 
  entityId={lead.id} 
  entityName={lead.company} 
/>
```

### In Customers Page:
```tsx
<Notes 
  entityType="customer" 
  entityId={customer.id} 
  entityName={customer.name} 
/>
```

### In Merchants Page:
```tsx
<Notes 
  entityType="merchant" 
  entityId={merchant.id} 
  entityName={merchant.businessName} 
/>
```

---

## 🏪 Using New Merchant Fields:

### Example: Update Merchant Form

```tsx
import { updateMerchant } from '@/lib/merchantActions';

// In your form:
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const result = await updateMerchant(merchant.id, {
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    businessName: formData.businessName,
    category: formData.category,
    accountStatus: formData.accountStatus,
    marketplaceStatus: formData.marketplaceStatus,
    
    // New subscription fields
    plan: formData.plan,
    trialFlag: formData.trialFlag,
    signUpDate: formData.signUpDate,
    saasStartDate: formData.saasStartDate,
    saasEndDate: formData.saasEndDate,
    
    // CR fields
    crId: formData.crId,
    crCertificate: formData.crCertificate,
    
    // VAT fields
    vatId: formData.vatId,
    vatCertificate: formData.vatCertificate,
    
    // ZATCA fields
    zatcaIdentificationType: formData.zatcaIdentificationType,
    zatcaId: formData.zatcaId,
    verificationStatus: formData.verificationStatus,
    
    // Payment fields
    lastPaymentDueDate: formData.lastPaymentDueDate,
    retentionStatus: formData.retentionStatus,
  });
  
  if (result.success) {
    alert('Merchant updated successfully!');
  }
};
```

---

## 📋 Example Form Fields for Merchant:

### Subscription Section:
```tsx
<div className="space-y-4">
  <h3 className="font-semibold">Subscription Details</h3>
  
  <div>
    <label>Plan</label>
    <select value={plan} onChange={e => setPlan(e.target.value)}>
      <option value="">Select Plan</option>
      <option value="basic">Basic</option>
      <option value="pro">Pro</option>
      <option value="enterprise">Enterprise</option>
    </select>
  </div>
  
  <div>
    <label>Trial Account</label>
    <input 
      type="checkbox" 
      checked={trialFlag} 
      onChange={e => setTrialFlag(e.target.checked)} 
    />
  </div>
  
  <div>
    <label>Sign Up Date</label>
    <input 
      type="date" 
      value={signUpDate} 
      onChange={e => setSignUpDate(e.target.value)} 
    />
  </div>
  
  <div>
    <label>SaaS Start Date</label>
    <input 
      type="date" 
      value={saasStartDate} 
      onChange={e => setSaasStartDate(e.target.value)} 
    />
  </div>
  
  <div>
    <label>SaaS End Date</label>
    <input 
      type="date" 
      value={saasEndDate} 
      onChange={e => setSaasEndDate(e.target.value)} 
    />
  </div>
</div>
```

### CR Section:
```tsx
<div className="space-y-4">
  <h3 className="font-semibold">Commercial Registration (CR)</h3>
  
  <div>
    <label>CR ID</label>
    <input 
      type="text" 
      value={crId} 
      onChange={e => setCrId(e.target.value)} 
    />
  </div>
  
  <div>
    <label>CR Certificate URL</label>
    <input 
      type="text" 
      value={crCertificate} 
      onChange={e => setCrCertificate(e.target.value)} 
      placeholder="https://..." 
    />
  </div>
</div>
```

### VAT Section:
```tsx
<div className="space-y-4">
  <h3 className="font-semibold">VAT Details</h3>
  
  <div>
    <label>VAT ID</label>
    <input 
      type="text" 
      value={vatId} 
      onChange={e => setVatId(e.target.value)} 
    />
  </div>
  
  <div>
    <label>VAT Certificate URL</label>
    <input 
      type="text" 
      value={vatCertificate} 
      onChange={e => setVatCertificate(e.target.value)} 
      placeholder="https://..." 
    />
  </div>
</div>
```

### ZATCA Section:
```tsx
<div className="space-y-4">
  <h3 className="font-semibold">ZATCA Details</h3>
  
  <div>
    <label>ZATCA Identification Type</label>
    <select 
      value={zatcaIdentificationType} 
      onChange={e => setZatcaIdentificationType(e.target.value)}
    >
      <option value="">Select Type</option>
      <option value="TIN">TIN</option>
      <option value="CRN">CRN</option>
      <option value="MOM">MOM</option>
      <option value="MLS">MLS</option>
    </select>
  </div>
  
  <div>
    <label>ZATCA ID</label>
    <input 
      type="text" 
      value={zatcaId} 
      onChange={e => setZatcaId(e.target.value)} 
    />
  </div>
  
  <div>
    <label>Verification Status</label>
    <select 
      value={verificationStatus} 
      onChange={e => setVerificationStatus(e.target.value)}
    >
      <option value="">Select Status</option>
      <option value="pending">Pending</option>
      <option value="verified">Verified</option>
      <option value="rejected">Rejected</option>
    </select>
  </div>
</div>
```

### Payment & Retention Section:
```tsx
<div className="space-y-4">
  <h3 className="font-semibold">Payment & Retention</h3>
  
  <div>
    <label>Last Payment Due Date</label>
    <input 
      type="date" 
      value={lastPaymentDueDate} 
      onChange={e => setLastPaymentDueDate(e.target.value)} 
    />
  </div>
  
  <div>
    <label>Retention Status</label>
    <select 
      value={retentionStatus} 
      onChange={e => setRetentionStatus(e.target.value)}
    >
      <option value="">Select Status</option>
      <option value="active">Active</option>
      <option value="at_risk">At Risk</option>
      <option value="churned">Churned</option>
      <option value="retained">Retained</option>
    </select>
  </div>
</div>
```

---

## 📁 Files Created:

1. **lib/noteActions.ts** - Actions for managing notes
2. **lib/merchantActions.ts** - Actions for merchant CRUD with new fields
3. **components/Notes.tsx** - Reusable notes component
4. **Updated schema.prisma** - Added Note model and new merchant fields

---

## 🎯 Next Steps:

1. Run `npx prisma db push` to apply schema changes
2. Add Notes component to your detail pages/modals
3. Update merchant forms to include new fields
4. Test adding notes to leads, customers, and merchants

---

## 💡 Tips:

- Notes are automatically sorted by newest first
- Each note shows who added it and when
- Notes can be deleted by clicking the "Delete" button
- All new merchant fields are optional (can be null)
- Use the `getMerchantDetails` action to fetch merchant data with all new fields

---

## 🔍 Quick Test:

After running `npx prisma db push`, try this:

1. Go to any merchant page
2. Add the Notes component:
   ```tsx
   <Notes entityType="merchant" entityId={1} entityName="Test Merchant" />
   ```
3. Add a note and verify it saves with your name and timestamp
4. Refresh the page and see the note persists

Done! 🎉
