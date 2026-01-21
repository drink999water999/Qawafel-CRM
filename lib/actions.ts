'use server';

import { revalidatePath } from 'next/cache';
import prisma from './prisma';

// ============== CUSTOMERS ==============
export async function getCustomers() {
  return await prisma.customer.findMany({
    orderBy: { id: 'asc' },
  });
}

export async function createCustomer(data: {
  name: string;
  company: string;
  email: string;
  phone?: string;
  accountStatus: string;
  marketplaceStatus: string;
}) {
  const customer = await prisma.customer.create({
    data: {
      ...data,
      joinDate: new Date(),
    },
  });
  revalidatePath('/');
  return customer;
}

export async function updateCustomer(
  id: number,
  data: {
    name?: string;
    company?: string;
    email?: string;
    phone?: string;
    accountStatus?: string;
    marketplaceStatus?: string;
  }
) {
  const customer = await prisma.customer.update({
    where: { id },
    data,
  });
  revalidatePath('/');
  return customer;
}

export async function deleteCustomer(id: number) {
  await prisma.customer.delete({
    where: { id },
  });
  revalidatePath('/');
}

// ============== MERCHANTS ==============
export async function getMerchants() {
  return await prisma.merchant.findMany({
    orderBy: { id: 'asc' },
  });
}

export async function createMerchant(data: {
  name: string;
  businessName: string;
  category: string;
  email: string;
  phone?: string;
  accountStatus: string;
  marketplaceStatus: string;
}) {
  const merchant = await prisma.merchant.create({
    data: {
      ...data,
      joinDate: new Date(),
    },
  });
  revalidatePath('/');
  return merchant;
}

export async function updateMerchant(
  id: number,
  data: {
    name?: string;
    businessName?: string;
    category?: string;
    email?: string;
    phone?: string;
    accountStatus?: string;
    marketplaceStatus?: string;
    // Subscription fields
    plan?: string;
    signUpDate?: string;
    trialFlag?: boolean;
    saasStartDate?: string;
    saasEndDate?: string;
    // CR fields
    crId?: string;
    crCertificate?: string;
    // VAT fields
    vatId?: string;
    vatCertificate?: string;
    // ZATCA fields
    zatcaIdentificationType?: string;
    zatcaId?: string;
    verificationStatus?: string;
    // Payment fields
    lastPaymentDueDate?: string;
    retentionStatus?: string;
  }
) {
  const updateData: {
    name?: string;
    businessName?: string;
    category?: string;
    email?: string;
    phone?: string | null;
    accountStatus?: string;
    marketplaceStatus?: string;
    plan?: string | null;
    trialFlag?: boolean;
    signUpDate?: Date;
    saasStartDate?: Date;
    saasEndDate?: Date;
    crId?: string | null;
    crCertificate?: string | null;
    vatId?: string | null;
    vatCertificate?: string | null;
    zatcaIdentificationType?: string | null;
    zatcaId?: string | null;
    verificationStatus?: string | null;
    lastPaymentDueDate?: Date;
    retentionStatus?: string | null;
  } = {
    name: data.name,
    businessName: data.businessName,
    category: data.category,
    email: data.email,
    phone: data.phone || null,
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

  const merchant = await prisma.merchant.update({
    where: { id },
    data: updateData,
  });
  revalidatePath('/');
  return merchant;
}

export async function deleteMerchant(id: number) {
  await prisma.merchant.delete({
    where: { id },
  });
  revalidatePath('/');
}

// ============== LEADS ==============
export async function getLeads() {
  return await prisma.lead.findMany({
    orderBy: { id: 'desc' },
  });
}

export async function createLead(data: {
  company: string;
  contactName: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  value: number;
  businessSize?: string;
  numberOfBranches?: number;
  formToken?: string;
}) {
  const lead = await prisma.lead.create({
    data,
  });
  revalidatePath('/');
  return lead;
}

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
  const lead = await prisma.lead.update({
    where: { id },
    data,
  });
  revalidatePath('/');
  return lead;
}

export async function deleteLead(id: number) {
  await prisma.lead.delete({
    where: { id },
  });
  revalidatePath('/');
}

export async function getLeadByToken(token: string) {
  return await prisma.lead.findUnique({
    where: { formToken: token },
  });
}

export async function updateLeadByToken(
  token: string,
  data: {
    businessSize?: string;
    numberOfBranches?: number;
  }
) {
  const lead = await prisma.lead.update({
    where: { formToken: token },
    data,
  });
  return lead;
}

// ============== DEALS ==============
export async function getDeals() {
  return await prisma.deal.findMany({
    orderBy: { id: 'desc' },
  });
}

export async function createDeal(data: {
  title: string;
  company: string;
  contactName: string;
  value: number;
  stage: string;
  probability: number;
  closeDate: Date;
}) {
  const deal = await prisma.deal.create({
    data,
  });
  revalidatePath('/');
  return deal;
}

export async function updateDeal(
  id: number,
  data: {
    title?: string;
    company?: string;
    contactName?: string;
    value?: number;
    stage?: string;
    probability?: number;
    closeDate?: Date;
  }
) {
  const deal = await prisma.deal.update({
    where: { id },
    data,
  });
  revalidatePath('/');
  return deal;
}

export async function deleteDeal(id: number) {
  await prisma.deal.delete({
    where: { id },
  });
  revalidatePath('/');
}

// ============== PROPOSALS ==============
export async function getProposals() {
  return await prisma.proposal.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function createProposal(data: {
  title: string;
  clientName: string;
  clientCompany: string;
  value: number;
  currency: string;
  status: string;
  validUntil: Date;
  sentDate?: Date;
}) {
  const proposal = await prisma.proposal.create({
    data: {
      ...data,
      createdAt: new Date(),
    },
  });
  revalidatePath('/');
  return proposal;
}

export async function updateProposal(
  id: number,
  data: {
    title?: string;
    clientName?: string;
    clientCompany?: string;
    value?: number;
    currency?: string;
    status?: string;
    validUntil?: Date;
    sentDate?: Date;
  }
) {
  const proposal = await prisma.proposal.update({
    where: { id },
    data,
  });
  revalidatePath('/');
  return proposal;
}

export async function deleteProposal(id: number) {
  await prisma.proposal.delete({
    where: { id },
  });
  revalidatePath('/');
}

// ============== ACTIVITIES ==============
export async function getActivities() {
  const activities = await prisma.activity.findMany({
    orderBy: { timestamp: 'desc' },
  });
  
  // Convert BigInt timestamp to number for serialization
  return activities.map(activity => ({
    ...activity,
    timestamp: Number(activity.timestamp),
  }));
}

export async function createActivity(data: {
  text: string;
  icon: string;
  userId?: number;
  userType?: string;
}) {
  const activity = await prisma.activity.create({
    data: {
      ...data,
      timestamp: BigInt(Date.now()),
    },
  });
  revalidatePath('/');
  return activity;
}

// ============== USER PROFILE ==============
export async function getUserProfile() {
  return await prisma.userProfile.findUnique({
    where: { id: 1 },
  });
}

export async function updateUserProfile(data: {
  fullName?: string;
  email?: string;
  phone?: string;
}) {
  const profile = await prisma.userProfile.update({
    where: { id: 1 },
    data,
  });
  revalidatePath('/');
  return profile;
}

// ============== INITIALIZATION ==============
export async function initializeData() {
  // Run all queries in parallel for better performance
  const [customers, merchants, leads, deals, proposals, activities, userProfile] = 
    await Promise.all([
      getCustomers(),
      getMerchants(),
      getLeads(),
      getDeals(),
      getProposals(),
      getActivities(),
      getUserProfile(),
    ]);

  return {
    customers,
    merchants,
    leads,
    deals,
    proposals,
    activities,
    userProfile,
  };
}
