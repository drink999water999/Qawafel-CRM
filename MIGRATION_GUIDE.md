# Migration Guide - Merchants & Customers Update

## What Changed

### ✅ Renamed Models
- **Vendors** → **Merchants**
- **Retailers** → **Customers**

### ✅ Removed Models
- **Tickets** - Completely removed from the system

### ✅ Fixed Features
- **Dashboard Quick Actions** - Now functional! Click to navigate:
  - "Add Lead" → Opens Leads page
  - "Create Proposal" → Opens Proposals page
  - "View Deals" → Opens Deals page

## Database Migration Required

After deploying, you MUST run these commands:

```bash
# 1. Push new schema to database
npm run prisma:push

# 2. Reseed the database with new names
npm run prisma:seed
```

**⚠️ WARNING:** This will drop existing retailers/vendors tables and create new customers/merchants tables.

If you have important data, export it first!

## What's Updated

### Files Changed:
- ✅ `prisma/schema.prisma` - New Customer/Merchant models
- ✅ `prisma/seed.ts` - Updated seed data
- ✅ `lib/actions.ts` - All functions renamed
- ✅ `components/CustomersPage.tsx` - New (was RetailersPage)
- ✅ `components/MerchantsPage.tsx` - New (was VendorsPage)
- ✅ `components/CRMDashboard.tsx` - Updated routing
- ✅ `components/Sidebar.tsx` - Updated navigation
- ✅ `components/Dashboard.tsx` - Working quick actions!

### Database Tables:
- ❌ `retailers` → ✅ `customers`
- ❌ `vendors` → ✅ `merchants`
- ❌ `tickets` → Removed

## New Navigation

Sidebar now shows:
- Dashboard
- Leads
- Deals
- **Merchants** (was Vendors)
- **Customers** (was Retailers)
- Proposals
- Settings

## API Changes

### Before:
```typescript
getRetailers()
createRetailer(data)
updateRetailer(id, data)

getVendors()
createVendor(data)
updateVendor(id, data)
```

### After:
```typescript
getCustomers()
createCustomer(data)
updateCustomer(id, data)

getMerchants()
createMerchant(data)
updateMerchant(id, data)
```

## Quick Actions Work!

The dashboard buttons now navigate:
- Click "Add Lead" → Goes to Leads page
- Click "Create Proposal" → Goes to Proposals page
- Click "View Deals" → Goes to Deals page

## Testing Checklist

After deployment:
- [ ] Run `npm run prisma:push`
- [ ] Run `npm run prisma:seed`
- [ ] Login with admin/admin
- [ ] Check Merchants page
- [ ] Check Customers page
- [ ] Click quick action buttons on dashboard
- [ ] Verify all CRUD operations work

## Summary

✅ Cleaner naming (Merchants/Customers instead of Vendors/Retailers)
✅ Removed unused Tickets feature
✅ Fixed dashboard quick actions
✅ All functionality preserved
✅ Better user experience
