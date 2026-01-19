'use server';

import { revalidatePath } from 'next/cache';
import prisma from './prisma';

// ============== RETAILERS ==============
export async function getRetailers() {
  return await prisma.retailer.findMany({
    orderBy: { id: 'asc' },
  });
}

export async function createRetailer(data: {
  name: string;
  company: string;
  email: string;
  phone?: string;
  accountStatus: string;
  marketplaceStatus: string;
}) {
  const retailer = await prisma.retailer.create({
    data: {
      ...data,
      joinDate: new Date(),
    },
  });
  revalidatePath('/');
  return retailer;
}

export async function updateRetailer(
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
  const retailer = await prisma.retailer.update({
    where: { id },
    data,
  });
  revalidatePath('/');
  return retailer;
}

// ============== VENDORS ==============
export async function getVendors() {
  return await prisma.vendor.findMany({
    orderBy: { id: 'asc' },
  });
}

export async function createVendor(data: {
  name: string;
  businessName: string;
  category: string;
  email: string;
  phone?: string;
  accountStatus: string;
  marketplaceStatus: string;
}) {
  const vendor = await prisma.vendor.create({
    data: {
      ...data,
      joinDate: new Date(),
    },
  });
  revalidatePath('/');
  return vendor;
}

export async function updateVendor(
  id: number,
  data: {
    name?: string;
    businessName?: string;
    category?: string;
    email?: string;
    phone?: string;
    accountStatus?: string;
    marketplaceStatus?: string;
  }
) {
  const vendor = await prisma.vendor.update({
    where: { id },
    data,
  });
  revalidatePath('/');
  return vendor;
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

// ============== TICKETS ==============
export async function getTickets() {
  return await prisma.ticket.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function createTicket(data: {
  title: string;
  description: string;
  status: string;
  type: string;
  userId: number;
  userType: string;
}) {
  const ticket = await prisma.ticket.create({
    data: {
      ...data,
      createdAt: new Date(),
    },
  });
  revalidatePath('/');
  return ticket;
}

export async function updateTicket(
  id: number,
  data: {
    title?: string;
    description?: string;
    status?: string;
    type?: string;
  }
) {
  const ticket = await prisma.ticket.update({
    where: { id },
    data,
  });
  revalidatePath('/');
  return ticket;
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
  const [retailers, vendors, leads, deals, proposals, tickets, activities, userProfile] = 
    await Promise.all([
      getRetailers(),
      getVendors(),
      getLeads(),
      getDeals(),
      getProposals(),
      getTickets(),
      getActivities(),
      getUserProfile(),
    ]);

  return {
    retailers,
    vendors,
    leads,
    deals,
    proposals,
    tickets,
    activities,
    userProfile,
  };
}
