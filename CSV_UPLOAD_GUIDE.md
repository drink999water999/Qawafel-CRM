# CSV Upload Feature

## Overview
You can now bulk import Leads, Merchants, and Customers using CSV files.

## How It Works
1. Click the **"Upload CSV"** button on any of these pages:
   - Leads
   - Merchants
   - Customers

2. Select your CSV file

3. The system will:
   - ✅ Create new records if email/phone doesn't exist
   - ✅ Update existing records if email/phone matches
   - ✅ Set status to "New" by default if not provided
   - ✅ Show you a summary (imported/updated/errors)

## CSV Format

### Leads CSV
```csv
company,contactName,email,phone,status,source,value
TechCorp,John Doe,john@techcorp.com,+1234567890,New,Website,5000
RetailCo,Jane Smith,jane@retailco.com,+0987654321,Qualified,Referral,10000
```

**Required columns:**
- `company` - Company name
- `contactName` or `contact_name` or `name` - Contact person name
- `email` - Email address
- `phone` - Phone number

**Optional columns:**
- `status` - Lead status (defaults to "New" if empty)
- `source` - Lead source (defaults to "CSV Import")
- `value` - Deal value (defaults to 0)

---

### Merchants CSV
```csv
name,businessName,category,email,phone,accountStatus,marketplaceStatus,joinDate
Ahmed Khan,Khan Electronics,Electronics,ahmed@khan.com,+966501234567,Active,Activated,2024-01-15
Sara Ali,Ali Groceries,Food,sara@ali.com,+966502345678,Active,Activated,2024-02-20
```

**Required columns:**
- `name` - Contact name
- `businessName` or `business_name` - Business name
- `category` - Business category
- `email` - Email address
- `phone` - Phone number

**Optional columns:**
- `accountStatus` or `account_status` or `status` - Account status (defaults to "Active")
- `marketplaceStatus` or `marketplace_status` - Marketplace status (defaults to "Activated")
- `joinDate` or `join_date` - Join date (defaults to today)

---

### Customers CSV
```csv
name,company,email,phone,accountStatus,marketplaceStatus,joinDate
Ahmed Al-Farsi,Farsi Supermarket,ahmed@farsi.com,555-0101,Active,Activated,2023-01-15
Fatima Zahrani,Zahrani Shop,fatima@zahrani.com,555-0102,Active,Retained,2023-02-20
```

**Required columns:**
- `name` - Customer name
- `company` - Company name
- `email` - Email address
- `phone` - Phone number

**Optional columns:**
- `accountStatus` or `account_status` or `status` - Account status (defaults to "Active")
- `marketplaceStatus` or `marketplace_status` - Marketplace status (defaults to "Activated")
- `joinDate` or `join_date` - Join date (defaults to today)

---

## Phone Number Format

### ✅ Phone numbers are stored as TEXT (VARCHAR), NOT BigInt

**Why TEXT is correct:**

1. **Leading Zeros** - Phone numbers like `0501234567` would lose the leading zero in BigInt
2. **International Format** - Supports `+966501234567`, `+1-555-0101`, etc.
3. **Special Characters** - Can include `-`, `(`, `)`, spaces
4. **Not Mathematical** - Never used for calculations
5. **Variable Length** - Different countries have different lengths

**Supported formats:**
- `+966501234567` (International)
- `0501234567` (Local with leading zero)
- `555-0101` (With dashes)
- `(555) 0101` (With parentheses)
- `555 0101` (With spaces)

---

## Update Logic

The system matches existing records by **email OR phone**:

```typescript
// If email OR phone matches, UPDATE the record
// Otherwise, CREATE a new record
```

This means:
- If you upload `john@example.com` and it exists → **Update**
- If you upload phone `+123456789` and it exists → **Update**
- If neither email nor phone exist → **Create new**

---

## Error Handling

The upload will:
- ✅ Continue processing even if some rows fail
- ✅ Show you a summary at the end
- ✅ Tell you how many succeeded/failed

Example result:
```
CSV imported successfully!

New records: 45
Updated records: 12
Errors: 3
```

---

## CSV Tips

1. **Use UTF-8 encoding** - Ensures special characters work
2. **No empty lines** - Remove blank rows
3. **Header row required** - First row must have column names
4. **Column names flexible** - Case-insensitive, accepts variations:
   - `contactName`, `contact_name`, `name` all work
   - `accountStatus`, `account_status`, `status` all work

5. **Date format** - Use `YYYY-MM-DD` format:
   - ✅ `2024-01-15`
   - ❌ `01/15/2024`

---

## Example Workflow

### 1. Export existing data
Export from your current system as CSV

### 2. Format CSV
Make sure column headers match (see formats above)

### 3. Upload
Click "Upload CSV" on the appropriate page

### 4. Review
Check the import summary

### 5. Verify
Browse the records to ensure they imported correctly

---

## Common Issues

### "Failed to import CSV"
- Check file is valid CSV format
- Ensure UTF-8 encoding
- Verify required columns are present

### "Some rows failed"
- Check those rows have valid email addresses
- Ensure phone numbers don't have invalid characters
- Verify dates are in `YYYY-MM-DD` format

### "All rows show as updated, none created"
- Your data already exists (matched by email/phone)
- This is normal if re-importing existing data

---

## Security Notes

- CSV files are processed on the server
- Only admins can upload CSV files
- Data is validated before inserting
- Duplicates are handled by update logic

---

## Performance

- Can handle thousands of rows
- Processing happens in the background
- You'll see a loading indicator
- Results shown when complete

Enjoy bulk importing! 🚀
