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

        // Check if lead exists by email or phone
        const existing = await prisma.lead.findFirst({
          where: {
            OR: [
              { email: row.email },
              { phone: row.phone }
            ]
          }
        });

        const leadData = {
          company: row.company || 'Unknown',
          contactName: row.contactname || row.contact_name || row.name || 'Unknown',
          email: row.email || '',
          phone: row.phone || '',
          status: row.status || 'New',
          source: row.source || 'CSV Import',
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

        const existing = await prisma.merchant.findFirst({
          where: {
            OR: [
              { email: row.email },
              { phone: row.phone }
            ]
          }
        });

        const merchantData = {
          name: row.name || 'Unknown',
          businessName: row.businessname || row.business_name || row.name || 'Unknown',
          category: row.category || 'General',
          email: row.email || '',
          phone: row.phone || '',
          accountStatus: row.accountstatus || row.account_status || row.status || 'Active',
          marketplaceStatus: row.marketplacestatus || row.marketplace_status || 'Activated',
          joinDate: row.joindate || row.join_date ? new Date(row.joindate || row.join_date) : new Date(),
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

        const existing = await prisma.customer.findFirst({
          where: {
            OR: [
              { email: row.email },
              { phone: row.phone }
            ]
          }
        });

        const customerData = {
          name: row.name || 'Unknown',
          company: row.company || 'Unknown',
          email: row.email || '',
          phone: row.phone || '',
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
