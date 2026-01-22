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
      name: data.name,
      company: data.company,
      email: data.email,
      phone: data.phone ? BigInt(data.phone) : null,
      accountStatus: data.accountStatus,
      marketplaceStatus: data.marketplaceStatus,
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
  const updateData: {
    name?: string;
    company?: string;
    email?: string;
    phone?: bigint | null;
    accountStatus?: string;
    marketplaceStatus?: string;
  } = {};
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.company !== undefined) updateData.company = data.company;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone ? BigInt(data.phone) : null;
  if (data.accountStatus !== undefined) updateData.accountStatus = data.accountStatus;
  if (data.marketplaceStatus !== undefined) updateData.marketplaceStatus = data.marketplaceStatus;
  
  const customer = await prisma.customer.update({
    where: { id },
    data: updateData,
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
  accountStatus: boolean; // Changed to Boolean
}) {
  const merchant = await prisma.merchant.create({
    data: {
      name: data.name,
      businessName: data.businessName,
      category: data.category,
      email: data.email,
      phone: data.phone ? BigInt(data.phone) : null,
      accountStatus: data.accountStatus,
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
    accountStatus?: boolean; // Changed to Boolean
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
    phone?: bigint | null;
    accountStatus?: boolean;
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
  } = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.businessName !== undefined) updateData.businessName = data.businessName;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone ? BigInt(data.phone) : null;
  if (data.accountStatus !== undefined) updateData.accountStatus = data.accountStatus;
  if (data.plan !== undefined) updateData.plan = data.plan || null;
  if (data.trialFlag !== undefined) updateData.trialFlag = data.trialFlag;
  if (data.crId !== undefined) updateData.crId = data.crId || null;
  if (data.crCertificate !== undefined) updateData.crCertificate = data.crCertificate || null;
  if (data.vatId !== undefined) updateData.vatId = data.vatId || null;
  if (data.vatCertificate !== undefined) updateData.vatCertificate = data.vatCertificate || null;
  if (data.zatcaIdentificationType !== undefined) updateData.zatcaIdentificationType = data.zatcaIdentificationType || null;
  if (data.zatcaId !== undefined) updateData.zatcaId = data.zatcaId || null;
  if (data.verificationStatus !== undefined) updateData.verificationStatus = data.verificationStatus || null;
  if (data.retentionStatus !== undefined) updateData.retentionStatus = data.retentionStatus || null;

  // Convert date strings to Date objects
  if (data.signUpDate) updateData.signUpDate = new Date(data.signUpDate);
  if (data.saasStartDate) updateData.saasStartDate = new Date(data.saasStartDate);
  if (data.saasEndDate) updateData.saasEndDate = new Date(data.saasEndDate);
  if (data.lastPaymentDueDate) updateData.lastPaymentDueDate = new Date(data.lastPaymentDueDate);

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
    include: {
      status: true,
      source: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createLead(data: {
  company: string;
  contactName: string;
  email: string;
  phone: string;
  status: string; // Status name
  source: string; // Source name
  value: number;
  businessSize?: string;
  numberOfBranches?: number;
  formToken?: string;
}) {
  // Find status by name
  const status = await prisma.leadStatus.findFirst({
    where: { name: data.status },
  });
  if (!status) {
    throw new Error(`Invalid lead status: ${data.status}`);
  }

  // Find source by name
  const source = await prisma.leadSource.findFirst({
    where: { name: data.source },
  });
  if (!source) {
    throw new Error(`Invalid lead source: ${data.source}`);
  }

  const lead = await prisma.lead.create({
    data: {
      company: data.company,
      contactName: data.contactName,
      email: data.email,
      phone: BigInt(data.phone),
      statusId: status.id,
      sourceId: source.id,
      value: data.value,
      businessSize: data.businessSize,
      numberOfBranches: data.numberOfBranches,
      formToken: data.formToken,
    },
    include: {
      status: true,
      source: true,
    },
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
    status?: string; // Status name
    source?: string; // Source name
    value?: number;
    businessSize?: string;
    numberOfBranches?: number;
    formToken?: string;
  }
) {
  const updateData: {
    company?: string;
    contactName?: string;
    email?: string;
    phone?: bigint;
    value?: number;
    businessSize?: string;
    numberOfBranches?: number;
    formToken?: string;
    statusId?: number;
    sourceId?: number;
  } = {};

  if (data.company !== undefined) updateData.company = data.company;
  if (data.contactName !== undefined) updateData.contactName = data.contactName;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = BigInt(data.phone);
  if (data.value !== undefined) updateData.value = data.value;
  if (data.businessSize !== undefined) updateData.businessSize = data.businessSize;
  if (data.numberOfBranches !== undefined) updateData.numberOfBranches = data.numberOfBranches;
  if (data.formToken !== undefined) updateData.formToken = data.formToken;

  // Handle status if provided
  if (data.status) {
    const status = await prisma.leadStatus.findFirst({
      where: { name: data.status },
    });
    if (status) {
      updateData.statusId = status.id;
    }
  }

  // Handle source if provided
  if (data.source) {
    const source = await prisma.leadSource.findFirst({
      where: { name: data.source },
    });
    if (source) {
      updateData.sourceId = source.id;
    }
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: updateData,
    include: {
      status: true,
      source: true,
    },
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
    include: {
      status: true,
      source: true,
    },
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
    include: {
      status: true,
      source: true,
    },
  });
  return lead;
}

// Lead helper functions
export async function getLeadStatuses() {
  return await prisma.leadStatus.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
}

export async function getLeadSources() {
  return await prisma.leadSource.findMany({
    where: { isActive: true },
  });
}

// ============== DEALS ==============
export async function getDeals() {
  return await prisma.deal.findMany({
    include: {
      company: true,
      contact: true,
      stage: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createDeal(data: {
  title: string;
  company: string; // Company name
  contactName: string; // Contact name
  contactEmail?: string;
  contactPhone?: string;
  stage: string; // Stage name
  value: number;
  probability: number;
  closeDate: Date;
}) {
  // 1. Find or create company
  let company = await prisma.company.findFirst({
    where: { name: data.company },
  });

  if (!company) {
    company = await prisma.company.create({
      data: { name: data.company },
    });
  }

  // 2. Find or create contact
  let contact = await prisma.contact.findFirst({
    where: {
      name: data.contactName,
      companyId: company.id,
    },
  });

  if (!contact) {
    contact = await prisma.contact.create({
      data: {
        name: data.contactName,
        email: data.contactEmail || null,
        phone: data.contactPhone ? BigInt(data.contactPhone) : null,
        companyId: company.id,
      },
    });
  }

  // 3. Find stage by name
  const stage = await prisma.dealStage.findFirst({
    where: { name: data.stage },
  });

  if (!stage) {
    throw new Error(`Invalid deal stage: ${data.stage}`);
  }

  // 4. Create deal
  const deal = await prisma.deal.create({
    data: {
      title: data.title,
      companyId: company.id,
      contactId: contact.id,
      stageId: stage.id,
      value: data.value,
      probability: data.probability,
      closeDate: data.closeDate,
    },
    include: {
      company: true,
      contact: true,
      stage: true,
    },
  });

  revalidatePath('/');
  return deal;
}

export async function updateDeal(
  id: number,
  data: {
    title?: string;
    company?: string; // Company name
    contactName?: string; // Contact name
    contactEmail?: string;
    contactPhone?: string;
    stage?: string; // Stage name
    value?: number;
    probability?: number;
    closeDate?: Date;
  }
) {
  const updateData: {
    title?: string;
    value?: number;
    probability?: number;
    closeDate?: Date;
    companyId?: number;
    contactId?: number;
    stageId?: number;
  } = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.value !== undefined) updateData.value = data.value;
  if (data.probability !== undefined) updateData.probability = data.probability;
  if (data.closeDate !== undefined) updateData.closeDate = data.closeDate;

  // Handle company/contact if provided
  if (data.company && data.contactName) {
    // Find or create company
    let company = await prisma.company.findFirst({
      where: { name: data.company },
    });

    if (!company) {
      company = await prisma.company.create({
        data: { name: data.company },
      });
    }

    // Find or create contact
    let contact = await prisma.contact.findFirst({
      where: {
        name: data.contactName,
        companyId: company.id,
      },
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          name: data.contactName,
          email: data.contactEmail || null,
          phone: data.contactPhone ? BigInt(data.contactPhone) : null,
          companyId: company.id,
        },
      });
    }

    updateData.companyId = company.id;
    updateData.contactId = contact.id;
  }

  // Handle stage if provided
  if (data.stage) {
    const stage = await prisma.dealStage.findFirst({
      where: { name: data.stage },
    });
    if (stage) {
      updateData.stageId = stage.id;
    }
  }

  const deal = await prisma.deal.update({
    where: { id },
    data: updateData,
    include: {
      company: true,
      contact: true,
      stage: true,
    },
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

// Deal helper function
export async function getDealStages() {
  return await prisma.dealStage.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
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
  const updateData: {
    fullName?: string;
    email?: string;
    phone?: bigint;
  } = {};
  
  if (data.fullName !== undefined) updateData.fullName = data.fullName;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined && data.phone) updateData.phone = BigInt(data.phone);
  
  const profile = await prisma.userProfile.update({
    where: { id: 1 },
    data: updateData,
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
