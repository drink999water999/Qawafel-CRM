'use server';

import { revalidatePath } from 'next/cache';
import prisma from './prisma';

// ============== CSV UPLOADS ==============

export async function uploadLeadsCSV(csvText: string) {
  try {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    let imported = 0;
    let updated = 0;
    let errors = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        // Convert phone to BigInt if present
        const phoneValue = row.phone ? BigInt(row.phone.replace(/\D/g, '')) : null;

        // Check if lead exists by email or phone
        const existing = await prisma.lead.findFirst({
          where: {
            OR: [
              { email: row.email },
              phoneValue ? { phone: phoneValue } : { email: row.email } // Avoid null in OR
            ]
          }
        });

        // Lookup status and source
        const statusName = row.status || 'New';
        const sourceName = row.source || 'CSV Import';
        
        const status = await prisma.leadStatus.findFirst({
          where: { name: statusName }
        });
        const source = await prisma.leadSource.findFirst({
          where: { name: sourceName }
        });

        if (!status || !source) {
          console.error(`Invalid status or source for row ${i}`);
          errors++;
          continue;
        }

        const leadData = {
          company: row.company || 'Unknown',
          contactName: row.contactname || row.contact_name || row.name || 'Unknown',
          email: row.email || '',
          phone: phoneValue || BigInt(0),
          statusId: status.id,
          sourceId: source.id,
          value: parseFloat(row.value || '0'),
        };

        if (existing) {
          // Update existing
          await prisma.lead.update({
            where: { id: existing.id },
            data: leadData,
          });
          updated++;
        } else {
          // Create new
          await prisma.lead.create({
            data: leadData,
          });
          imported++;
        }
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        errors++;
      }
    }

    revalidatePath('/');
    return { success: true, imported, updated, errors };
  } catch (error) {
    console.error('CSV upload error:', error);
    return { success: false, error: 'Failed to process CSV' };
  }
}

export async function uploadMerchantsCSV(csvText: string) {
  try {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    let imported = 0;
    let updated = 0;
    let errors = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        // Convert phone to BigInt if present
        const phoneValue = row.phone ? BigInt(row.phone.replace(/\D/g, '')) : null;

        // Check if ID is provided in CSV
        const providedId = row.id ? parseInt(row.id) : null;
        
        // ALWAYS search by email/phone first to find the merchant we want to update
        let existingMerchant = null;
        if (row.email || phoneValue) {
          existingMerchant = await prisma.merchant.findFirst({
            where: {
              OR: [
                row.email ? { email: row.email } : {},
                phoneValue ? { phone: phoneValue } : {},
              ].filter(obj => Object.keys(obj).length > 0)
            }
          });
        }

        // Convert accountStatus to boolean
        const accountStatusStr = (row.accountstatus || row.account_status || row.status || 'Active').toLowerCase();
        const accountStatus = accountStatusStr === 'active' || accountStatusStr === 'true' || accountStatusStr === '1';

        // Convert trial flag to boolean
        const trialFlagStr = (row.trialflag || row.trial_flag || 'No').toLowerCase();
        const trialFlag = trialFlagStr === 'yes' || trialFlagStr === 'true' || trialFlagStr === '1';

        // Helper function to parse dates safely
        const parseDate = (dateStr: string | undefined) => {
          if (!dateStr || dateStr.trim() === '' || dateStr === 'null' || dateStr === 'undefined') return null;
          try {
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? null : date;
          } catch {
            return null;
          }
        };

        const merchantData = {
          // Basic Info
          name: row.name || 'Unknown',
          businessName: row.businessname || row.business_name || row.name || 'Unknown',
          category: row.category || 'General',
          email: row.email || '',
          phone: phoneValue,
          accountStatus: accountStatus,
          
          // Subscription Fields
          plan: row.plan && row.plan.trim() !== '' ? row.plan : null,
          signUpDate: parseDate(row.signupdate || row.sign_up_date),
          trialFlag: trialFlag,
          trialStartDate: parseDate(row.trialstartdate || row.trial_start_date),
          trialEndDate: parseDate(row.trialenddate || row.trial_end_date),
          saasStartDate: parseDate(row.saasstartdate || row.saas_start_date),
          saasEndDate: parseDate(row.saasenddate || row.saas_end_date),
          
          // CR Fields
          crId: row.crid || row.cr_id || null,
          crCertificate: row.crcertificate || row.cr_certificate || null,
          
          // VAT Fields
          vatId: row.vatid || row.vat_id || null,
          vatCertificate: row.vatcertificate || row.vat_certificate || null,
          
          // ZATCA Fields
          zatcaIdentificationType: row.zatcaidentificationtype || row.zatca_identification_type || null,
          zatcaId: row.zatcaid || row.zatca_id || null,
          
          // Status & Payment
          verificationStatus: row.verificationstatus || row.verification_status || null,
          retentionStatus: row.retentionstatus || row.retention_status || null,
          lastPaymentDueDate: parseDate(row.lastpaymentduedate || row.last_payment_due_date),
        };

        // Handle the update/create logic
        if (existingMerchant) {
          // We found a merchant to update
          
          if (providedId && existingMerchant.id !== providedId) {
            // CSV wants to change the ID
            
            // Check if the desired ID is occupied by a DIFFERENT merchant
            const merchantAtTargetId = await prisma.merchant.findUnique({
              where: { id: providedId }
            });
            
            if (merchantAtTargetId && merchantAtTargetId.id !== existingMerchant.id) {
              // There's a different merchant at the target ID
              // Move that merchant to a new ID first
              
              // Find the next available ID
              const maxId = await prisma.merchant.aggregate({
                _max: { id: true }
              });
              const newId = (maxId._max.id || 0) + 1;
              
              // Move the conflicting merchant to new ID
              await prisma.$executeRaw`
                UPDATE merchants SET id = ${newId} WHERE id = ${providedId}
              `;
              
              // Update sequence to prevent conflicts
              await prisma.$executeRaw`
                SELECT setval('merchants_id_seq', ${newId})
              `;
            }
            
            // Now update the existing merchant with new ID and data
            await prisma.$executeRaw`
              UPDATE merchants 
              SET id = ${providedId},
                  name = ${merchantData.name},
                  business_name = ${merchantData.businessName},
                  category = ${merchantData.category},
                  email = ${merchantData.email},
                  phone = ${merchantData.phone},
                  account_status = ${merchantData.accountStatus},
                  plan = ${merchantData.plan},
                  sign_up_date = ${merchantData.signUpDate},
                  trial_flag = ${merchantData.trialFlag},
                  trial_start_date = ${merchantData.trialStartDate},
                  trial_end_date = ${merchantData.trialEndDate},
                  saas_start_date = ${merchantData.saasStartDate},
                  saas_end_date = ${merchantData.saasEndDate},
                  cr_id = ${merchantData.crId},
                  cr_certificate = ${merchantData.crCertificate},
                  vat_id = ${merchantData.vatId},
                  vat_certificate = ${merchantData.vatCertificate},
                  zatca_identification_type = ${merchantData.zatcaIdentificationType},
                  zatca_id = ${merchantData.zatcaId},
                  verification_status = ${merchantData.verificationStatus},
                  retention_status = ${merchantData.retentionStatus},
                  last_payment_due_date = ${merchantData.lastPaymentDueDate}
              WHERE id = ${existingMerchant.id}
            `;
          } else {
            // Just update normally (no ID change)
            await prisma.merchant.update({
              where: { id: existingMerchant.id },
              data: merchantData,
            });
          }
          updated++;
          
        } else if (providedId) {
          // No existing merchant found, create with specific ID
          
          // Check if ID is already taken
          const merchantAtTargetId = await prisma.merchant.findUnique({
            where: { id: providedId }
          });
          
          if (merchantAtTargetId) {
            // ID is taken, move that merchant first
            const maxId = await prisma.merchant.aggregate({
              _max: { id: true }
            });
            const newId = (maxId._max.id || 0) + 1;
            
            await prisma.$executeRaw`
              UPDATE merchants SET id = ${newId} WHERE id = ${providedId}
            `;
            
            await prisma.$executeRaw`
              SELECT setval('merchants_id_seq', ${newId})
            `;
          }
          
          // Create with specific ID
          await prisma.$executeRaw`
            INSERT INTO merchants (
              id, name, business_name, category, email, phone, account_status,
              plan, sign_up_date, trial_flag, trial_start_date, trial_end_date,
              saas_start_date, saas_end_date, cr_id, cr_certificate,
              vat_id, vat_certificate, zatca_identification_type, zatca_id,
              verification_status, retention_status, last_payment_due_date
            ) VALUES (
              ${providedId}, ${merchantData.name}, ${merchantData.businessName},
              ${merchantData.category}, ${merchantData.email}, ${merchantData.phone},
              ${merchantData.accountStatus}, ${merchantData.plan}, ${merchantData.signUpDate},
              ${merchantData.trialFlag}, ${merchantData.trialStartDate}, ${merchantData.trialEndDate},
              ${merchantData.saasStartDate}, ${merchantData.saasEndDate}, ${merchantData.crId},
              ${merchantData.crCertificate}, ${merchantData.vatId}, ${merchantData.vatCertificate},
              ${merchantData.zatcaIdentificationType}, ${merchantData.zatcaId},
              ${merchantData.verificationStatus}, ${merchantData.retentionStatus},
              ${merchantData.lastPaymentDueDate}
            )
          `;
          imported++;
        } else {
          // Create new merchant with auto-increment ID
          await prisma.merchant.create({
            data: merchantData,
          });
          imported++;
        }
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        errors++;
      }
    }

    revalidatePath('/');
    return { success: true, imported, updated, errors };
  } catch (error) {
    console.error('CSV upload error:', error);
    return { success: false, error: 'Failed to process CSV' };
  }
}

export async function uploadCustomersCSV(csvText: string) {
  try {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    let imported = 0;
    let updated = 0;
    let errors = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        // Convert phone to BigInt if present
        const phoneValue = row.phone ? BigInt(row.phone.replace(/\D/g, '')) : null;

        const existing = await prisma.customer.findFirst({
          where: {
            OR: [
              { email: row.email },
              phoneValue ? { phone: phoneValue } : { email: row.email } // Avoid null in OR
            ]
          }
        });

        const customerData = {
          name: row.name || 'Unknown',
          company: row.company || 'Unknown',
          email: row.email || '',
          phone: phoneValue,
          accountStatus: row.accountstatus || row.account_status || row.status || 'Active',
          marketplaceStatus: row.marketplacestatus || row.marketplace_status || 'Activated',
          joinDate: row.joindate || row.join_date ? new Date(row.joindate || row.join_date) : new Date(),
        };

        if (existing) {
          await prisma.customer.update({
            where: { id: existing.id },
            data: customerData,
          });
          updated++;
        } else {
          await prisma.customer.create({
            data: customerData,
          });
          imported++;
        }
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        errors++;
      }
    }

    revalidatePath('/');
    return { success: true, imported, updated, errors };
  } catch (error) {
    console.error('CSV upload error:', error);
    return { success: false, error: 'Failed to process CSV' };
  }
}

// Upload Merchant Users CSV
export async function uploadMerchantUsersCSV(csvContent: string) {
  try {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return { success: false, error: 'CSV file is empty or has no data rows' };
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    let imported = 0;
    let updated = 0;
    let errors = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        // Required fields
        const merchantId = row.merchant_id || row.merchantid;
        const email = row.email;
        const name = row.name;

        if (!merchantId || !email || !name) {
          console.error(`Row ${i}: Missing required fields (merchant_id, email, name)`);
          errors++;
          continue;
        }

        // Check if merchant exists
        const merchant = await prisma.merchant.findUnique({
          where: { id: parseInt(merchantId) }
        });

        if (!merchant) {
          console.error(`Row ${i}: Merchant ID ${merchantId} not found`);
          errors++;
          continue;
        }

        // Convert phone to BigInt if present
        const phoneValue = row.phone ? BigInt(row.phone.replace(/\D/g, '')) : null;
        const role = row.role || null;

        // Check if user already exists by email
        let user = await prisma.merchantUser.findUnique({
          where: { email }
        });

        // If user doesn't exist, create new user
        if (!user) {
          user = await prisma.merchantUser.create({
            data: {
              name,
              email,
              phone: phoneValue,
            },
          });
        }

        // Check if mapping already exists
        const existingMapping = await prisma.merchantUserMapping.findUnique({
          where: {
            merchantId_userId: {
              merchantId: parseInt(merchantId),
              userId: user.id,
            },
          },
        });

        if (existingMapping) {
          // Update existing mapping (maybe update role)
          await prisma.merchantUserMapping.update({
            where: { id: existingMapping.id },
            data: { role },
          });
          updated++;
        } else {
          // Create new mapping
          await prisma.merchantUserMapping.create({
            data: {
              merchantId: parseInt(merchantId),
              userId: user.id,
              role,
            },
          });
          imported++;
        }
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        errors++;
      }
    }

    revalidatePath('/');
    return { success: true, imported, updated, errors };
  } catch (error) {
    console.error('CSV upload error:', error);
    return { success: false, error: 'Failed to process CSV' };
  }
}
