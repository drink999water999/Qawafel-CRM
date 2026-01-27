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

        const existing = await prisma.merchant.findFirst({
          where: {
            OR: [
              { email: row.email },
              phoneValue ? { phone: phoneValue } : { email: row.email } // Avoid null in OR
            ]
          }
        });

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
          joinDate: parseDate(row.joindate || row.join_date) || new Date(),
          
          // Subscription Fields
          plan: row.plan && row.plan.trim() !== '' ? row.plan : null,
          signUpDate: parseDate(row.signupdate || row.sign_up_date),
          trialFlag: trialFlag,
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

        if (existing) {
          await prisma.merchant.update({
            where: { id: existing.id },
            data: merchantData,
          });
          updated++;
        } else {
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
