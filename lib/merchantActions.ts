'use server';

import { revalidatePath } from 'next/cache';
import prisma from './prisma';
import { requireAuth } from './auth';

export async function updateMerchant(id: number, data: {
  name: string;
  email: string;
  phone?: string;
  businessName: string;
  category: string;
  accountStatus: string;
  marketplaceStatus: string;
  plan?: string;
  trialFlag?: boolean;
  signUpDate?: string;
  saasStartDate?: string;
  saasEndDate?: string;
  crId?: string;
  crCertificate?: string;
  vatId?: string;
  vatCertificate?: string;
  zatcaIdentificationType?: string;
  zatcaId?: string;
  verificationStatus?: string;
  lastPaymentDueDate?: string;
  retentionStatus?: string;
}) {
  await requireAuth();

  try {
    const updateData: {
      name: string;
      email: string;
      phone: string | null;
      businessName: string;
      category: string;
      accountStatus: string;
      marketplaceStatus: string;
      plan: string | null;
      trialFlag: boolean;
      crId: string | null;
      crCertificate: string | null;
      vatId: string | null;
      vatCertificate: string | null;
      zatcaIdentificationType: string | null;
      zatcaId: string | null;
      verificationStatus: string | null;
      retentionStatus: string | null;
      signUpDate?: Date;
      saasStartDate?: Date;
      saasEndDate?: Date;
      lastPaymentDueDate?: Date;
    } = {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      businessName: data.businessName,
      category: data.category,
      accountStatus: data.accountStatus,
      marketplaceStatus: data.marketplaceStatus,
      plan: data.plan || null,
      trialFlag: data.trialFlag || false,
      crId: data.crId || null,
      crCertificate: data.crCertificate || null,
      vatId: data.vatId || null,
      vatCertificate: data.vatCertificate || null,
      zatcaIdentificationType: data.zatcaIdentificationType || null,
      zatcaId: data.zatcaId || null,
      verificationStatus: data.verificationStatus || null,
      retentionStatus: data.retentionStatus || null,
    };

    // Convert date strings to Date objects
    if (data.signUpDate) {
      updateData.signUpDate = new Date(data.signUpDate);
    }
    if (data.saasStartDate) {
      updateData.saasStartDate = new Date(data.saasStartDate);
    }
    if (data.saasEndDate) {
      updateData.saasEndDate = new Date(data.saasEndDate);
    }
    if (data.lastPaymentDueDate) {
      updateData.lastPaymentDueDate = new Date(data.lastPaymentDueDate);
    }

    await prisma.merchant.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error updating merchant:', error);
    return { success: false, error: 'Failed to update merchant' };
  }
}

export async function getMerchantDetails(id: number) {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id },
    });

    return { success: true, merchant };
  } catch (error) {
    console.error('Error fetching merchant:', error);
    return { success: false, error: 'Failed to fetch merchant details' };
  }
}
