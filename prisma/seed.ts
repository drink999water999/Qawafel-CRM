import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // ========================================
  // STEP 1: Seed Lookup Tables (Phase 1)
  // ========================================
  
  // Seed Lead Statuses
  console.log('Seeding Lead Statuses...');
  const leadStatuses = [
    { name: 'New', color: '#6B7280', order: 1 },
    { name: 'Contacted', color: '#3B82F6', order: 2 },
    { name: 'Qualified', color: '#8B5CF6', order: 3 },
    { name: 'Proposal', color: '#F59E0B', order: 4 },
    { name: 'Negotiation', color: '#FBBF24', order: 5 },
    { name: 'Closed Won', color: '#10B981', order: 6 },
    { name: 'Lost', color: '#EF4444', order: 7 },
  ];
  
  for (const status of leadStatuses) {
    await prisma.leadStatus.upsert({
      where: { name: status.name },
      update: {},
      create: status,
    });
  }
  console.log('Lead Statuses seeded');

  // Seed Lead Sources
  console.log('Seeding Lead Sources...');
  const leadSources = [
    { name: 'Website' },
    { name: 'Referral' },
    { name: 'Cold Call' },
    { name: 'Trade Show' },
    { name: 'Partner' },
    { name: 'Social Media' },
    { name: 'Email Campaign' },
  ];
  
  for (const source of leadSources) {
    await prisma.leadSource.upsert({
      where: { name: source.name },
      update: {},
      create: source,
    });
  }
  console.log('Lead Sources seeded');

  // Seed Deal Stages
  console.log('Seeding Deal Stages...');
  const dealStages = [
    { name: 'New', color: '#6B7280', order: 1, isWon: false, isLost: false },
    { name: 'Discovery', color: '#3B82F6', order: 2, isWon: false, isLost: false },
    { name: 'Proposal', color: '#8B5CF6', order: 3, isWon: false, isLost: false },
    { name: 'Negotiation', color: '#F59E0B', order: 4, isWon: false, isLost: false },
    { name: 'Closed Won', color: '#10B981', order: 5, isWon: true, isLost: false },
    { name: 'Lost', color: '#EF4444', order: 6, isWon: false, isLost: true },
  ];
  
  for (const stage of dealStages) {
    await prisma.dealStage.upsert({
      where: { name: stage.name },
      update: {},
      create: stage,
    });
  }
  console.log('Deal Stages seeded');

  // ========================================
  // STEP 2: Seed Admin User
  // ========================================
  const adminUser = await prisma.user.upsert({
    where: { email: 'mohamed.hussein@qawafel.sa' },
    update: {},
    create: {
      email: 'mohamed.hussein@qawafel.sa',
      username: 'admin',
      password: 'admin',
      name: 'Mohamed Hussein',
      role: 'admin',
      approved: true,
      provider: 'credentials',
    },
  });
  console.log({ adminUser });

  // ========================================
  // STEP 3: Seed Customers (with BigInt phone)
  // ========================================
  console.log('Seeding Customers...');
  await prisma.customer.upsert({
    where: { email: 'ahmed@farsimarket.com' },
    update: {},
    create: {
      name: 'Ahmed Al-Farsi',
      company: 'Farsi Supermarket',
      email: 'ahmed@farsimarket.com',
      phone: BigInt('5550101'),
      accountStatus: 'Active',
      marketplaceStatus: 'Activated',
      joinDate: new Date('2023-01-15'),
    },
  });

  await prisma.customer.upsert({
    where: { email: 'fatima@zahranishop.com' },
    update: {},
    create: {
      name: 'Fatima Al-Zahrani',
      company: 'Zahrani Corner Shop',
      email: 'fatima@zahranishop.com',
      phone: BigInt('5550102'),
      accountStatus: 'Active',
      marketplaceStatus: 'Retained',
      joinDate: new Date('2023-02-20'),
    },
  });

  console.log('Customers seeded');

  // ========================================
  // STEP 4: Seed Merchants (with BigInt phone, Boolean accountStatus)
  // ========================================
  console.log('Seeding Merchants...');
  await prisma.merchant.upsert({
    where: { email: 'mohammed@khandates.com' },
    update: {},
    create: {
      name: 'Mohammed Khan',
      businessName: 'Khan Dates',
      category: 'Dates',
      email: 'mohammed@khandates.com',
      phone: BigInt('5550201'),
      accountStatus: true, // Active
      signUpDate: new Date('2023-03-10'),
      plan: 'Premium',
      trialFlag: false,
      saasStartDate: new Date('2023-03-10'),
      saasEndDate: new Date('2024-03-10'),
      retentionStatus: 'Active',
    },
  });

  await prisma.merchant.upsert({
    where: { email: 'aisha@abdullahspices.com' },
    update: {},
    create: {
      name: 'Aisha Abdullah',
      businessName: 'Abdullah Spices',
      category: 'Spices',
      email: 'aisha@abdullahspices.com',
      phone: BigInt('5550202'),
      accountStatus: false, // Inactive/Deactivated
      signUpDate: new Date('2023-04-05'),
      plan: 'Standard',
      trialFlag: false,
      retentionStatus: 'Churned',
    },
  });

  console.log('Merchants seeded');

  // ========================================
  // STEP 5: Seed Leads (with statusId, sourceId, BigInt phone)
  // ========================================
  console.log('Seeding Leads...');
  
  const newStatus = await prisma.leadStatus.findFirst({ where: { name: 'New' } });
  const qualifiedStatus = await prisma.leadStatus.findFirst({ where: { name: 'Qualified' } });
  const closedWonStatus = await prisma.leadStatus.findFirst({ where: { name: 'Closed Won' } });
  
  const websiteSource = await prisma.leadSource.findFirst({ where: { name: 'Website' } });
  const referralSource = await prisma.leadSource.findFirst({ where: { name: 'Referral' } });
  
  if (!newStatus || !qualifiedStatus || !closedWonStatus || !websiteSource || !referralSource) {
    throw new Error('Lead statuses or sources not found');
  }

  await prisma.lead.createMany({
    data: [
      {
        company: 'Fresh Foods Co.',
        contactName: 'Layla Ibrahim',
        email: 'layla@freshfoods.com',
        phone: BigInt('5550301'),
        statusId: newStatus.id,
        sourceId: websiteSource.id,
        value: 50000,
      },
      {
        company: 'City Mart',
        contactName: 'Khalid Hasan',
        email: 'khalid@citymart.com',
        phone: BigInt('5550302'),
        statusId: qualifiedStatus.id,
        sourceId: referralSource.id,
        value: 30000,
      },
      {
        company: 'Farsi Supermarket',
        contactName: 'Ahmed Al-Farsi',
        email: 'ahmed@farsimarket.com',
        phone: BigInt('5550304'),
        statusId: closedWonStatus.id,
        sourceId: referralSource.id,
        value: 25000,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Leads seeded');

  // ========================================
  // STEP 6: Seed Companies, Contacts, Deals
  // ========================================
  console.log('Seeding Companies, Contacts, and Deals...');
  
  const discoveryStage = await prisma.dealStage.findFirst({ where: { name: 'Discovery' } });
  const proposalStage = await prisma.dealStage.findFirst({ where: { name: 'Proposal' } });
  const wonStage = await prisma.dealStage.findFirst({ where: { name: 'Closed Won' } });
  
  if (!discoveryStage || !proposalStage || !wonStage) {
    throw new Error('Deal stages not found');
  }

  // Company 1: Fresh Foods Co.
  const freshFoodsCompany = await prisma.company.upsert({
    where: { name: 'Fresh Foods Co.' },
    update: {},
    create: { name: 'Fresh Foods Co.' },
  });

  // Check if contact exists first
  let laylaContact = await prisma.contact.findFirst({
    where: {
      name: 'Layla Ibrahim',
      companyId: freshFoodsCompany.id,
    }
  });

  if (!laylaContact) {
    laylaContact = await prisma.contact.create({
      data: {
        name: 'Layla Ibrahim',
        email: 'layla@freshfoods.com',
        phone: BigInt('5550301'),
        companyId: freshFoodsCompany.id,
      },
    });
  }

  await prisma.deal.create({
    data: {
      title: 'Expansion Deal with Fresh Foods Co.',
      companyId: freshFoodsCompany.id,
      contactId: laylaContact.id,
      stageId: discoveryStage.id,
      value: 75000,
      probability: 30,
      closeDate: new Date('2024-08-30'),
    },
  });

  // Company 2: City Mart
  const cityMartCompany = await prisma.company.upsert({
    where: { name: 'City Mart' },
    update: {},
    create: { name: 'City Mart' },
  });

  let khalidContact = await prisma.contact.findFirst({
    where: {
      name: 'Khalid Hasan',
      companyId: cityMartCompany.id,
    }
  });

  if (!khalidContact) {
    khalidContact = await prisma.contact.create({
      data: {
        name: 'Khalid Hasan',
        email: 'khalid@citymart.com',
        phone: BigInt('5550302'),
        companyId: cityMartCompany.id,
      },
    });
  }

  await prisma.deal.create({
    data: {
      title: 'Initial Supply for City Mart',
      companyId: cityMartCompany.id,
      contactId: khalidContact.id,
      stageId: proposalStage.id,
      value: 30000,
      probability: 50,
      closeDate: new Date('2024-07-25'),
    },
  });

  // Company 3: Farsi Supermarket
  const farsiCompany = await prisma.company.upsert({
    where: { name: 'Farsi Supermarket' },
    update: {},
    create: { name: 'Farsi Supermarket' },
  });

  let ahmedContact = await prisma.contact.findFirst({
    where: {
      name: 'Ahmed Al-Farsi',
      companyId: farsiCompany.id,
    }
  });

  if (!ahmedContact) {
    ahmedContact = await prisma.contact.create({
      data: {
        name: 'Ahmed Al-Farsi',
        email: 'ahmed@farsimarket.com',
        phone: BigInt('5550304'),
        companyId: farsiCompany.id,
      },
    });
  }

  await prisma.deal.create({
    data: {
      title: 'Q3 Dates Supply',
      companyId: farsiCompany.id,
      contactId: ahmedContact.id,
      stageId: wonStage.id,
      value: 25000,
      probability: 100,
      closeDate: new Date('2024-06-15'),
    },
  });

  console.log('Companies, Contacts, and Deals seeded');

  // ========================================
  // STEP 7: Seed Proposals
  // ========================================
  console.log('Seeding Proposals...');
  await prisma.proposal.createMany({
    data: [
      {
        title: 'Q4 2024 Dates Supply',
        clientName: 'Omar Ali',
        clientCompany: 'Desert Dates Ltd.',
        value: 45000,
        currency: 'SAR',
        status: 'Sent',
        validUntil: new Date('2024-09-30'),
        sentDate: new Date('2024-08-01'),
        createdAt: new Date('2024-07-15'),
      },
      {
        title: 'Spice Distribution Agreement',
        clientName: 'Noor Hassan',
        clientCompany: 'Spice World',
        value: 35000,
        currency: 'SAR',
        status: 'Draft',
        validUntil: new Date('2024-10-15'),
        sentDate: null,
        createdAt: new Date('2024-08-10'),
      },
    ],
    skipDuplicates: true,
  });

  console.log('Proposals seeded');
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
