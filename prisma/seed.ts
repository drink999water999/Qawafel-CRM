import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Seed Admin User
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: 'admin', // In production, this should be hashed!
      role: 'admin',
    },
  });
  console.log({ adminUser });

  // Seed Retailers
  const retailer1 = await prisma.retailer.upsert({
    where: { email: 'ahmed@farsimarket.com' },
    update: {},
    create: {
      name: 'Ahmed Al-Farsi',
      company: 'Farsi Supermarket',
      email: 'ahmed@farsimarket.com',
      phone: '555-0101',
      accountStatus: 'Active',
      marketplaceStatus: 'Activated',
      joinDate: new Date('2023-01-15'),
    },
  });

  const retailer2 = await prisma.retailer.upsert({
    where: { email: 'fatima@zahranishop.com' },
    update: {},
    create: {
      name: 'Fatima Al-Zahrani',
      company: 'Zahrani Corner Shop',
      email: 'fatima@zahranishop.com',
      phone: '555-0102',
      accountStatus: 'Active',
      marketplaceStatus: 'Retained',
      joinDate: new Date('2023-02-20'),
    },
  });

  console.log('Retailers seeded');

  // Seed Vendors
  const vendor1 = await prisma.vendor.upsert({
    where: { email: 'mohammed@khandates.com' },
    update: {},
    create: {
      name: 'Mohammed Khan',
      businessName: 'Khan Dates',
      category: 'Dates',
      email: 'mohammed@khandates.com',
      phone: '555-0201',
      accountStatus: 'Active',
      marketplaceStatus: 'Activated',
      joinDate: new Date('2023-03-10'),
    },
  });

  const vendor2 = await prisma.vendor.upsert({
    where: { email: 'aisha@abdullahspices.com' },
    update: {},
    create: {
      name: 'Aisha Abdullah',
      businessName: 'Abdullah Spices',
      category: 'Spices',
      email: 'aisha@abdullahspices.com',
      phone: '555-0202',
      accountStatus: 'Deactivated',
      marketplaceStatus: 'Churned',
      joinDate: new Date('2023-04-05'),
    },
  });

  console.log('Vendors seeded');

  // Seed Leads
  await prisma.lead.createMany({
    data: [
      {
        company: 'Modern Grocers',
        contactName: 'Yusuf Ahmed',
        email: 'yusuf@moderngrocers.sa',
        phone: '555-0301',
        status: 'New',
        source: 'Website',
        value: 50000,
        businessSize: '11-50 employees',
        numberOfBranches: 3,
        formToken: 'token-123-abc',
      },
      {
        company: 'Fresh Foods Co.',
        contactName: 'Layla Ibrahim',
        email: 'layla@freshfoods.co',
        phone: '555-0302',
        status: 'Contacted',
        source: 'Referral',
        value: 75000,
        businessSize: '51-200 employees',
        numberOfBranches: 12,
      },
      {
        company: 'City Mart',
        contactName: 'Khalid Hasan',
        email: 'khalid@citymart.sa',
        phone: '555-0303',
        status: 'Proposal',
        source: 'Cold Call',
        value: 30000,
        formToken: 'token-456-def',
      },
    ],
    skipDuplicates: true,
  });

  console.log('Leads seeded');

  // Seed Deals
  await prisma.deal.createMany({
    data: [
      {
        title: 'Expansion Deal with Fresh Foods Co.',
        company: 'Fresh Foods Co.',
        contactName: 'Layla Ibrahim',
        value: 75000,
        stage: 'Discovery',
        probability: 30,
        closeDate: new Date('2024-08-30'),
      },
      {
        title: 'Initial Supply for City Mart',
        company: 'City Mart',
        contactName: 'Khalid Hasan',
        value: 30000,
        stage: 'Proposal',
        probability: 50,
        closeDate: new Date('2024-07-25'),
      },
      {
        title: 'Q3 Dates Supply',
        company: 'Farsi Supermarket',
        contactName: 'Ahmed Al-Farsi',
        value: 25000,
        stage: 'Closed Won',
        probability: 100,
        closeDate: new Date('2024-06-15'),
      },
    ],
    skipDuplicates: true,
  });

  console.log('Deals seeded');

  // Seed Proposals
  await prisma.proposal.createMany({
    data: [
      {
        title: 'Q3 Wholesale Package',
        clientName: 'Khalid Hasan',
        clientCompany: 'City Mart',
        value: 30000,
        currency: 'SAR',
        status: 'Sent',
        validUntil: new Date('2024-07-20'),
        sentDate: new Date('2024-06-20'),
        createdAt: new Date('2024-06-19'),
      },
      {
        title: 'Draft for Regional Supplier',
        clientName: 'Noura Saad',
        clientCompany: 'Saad Trading',
        value: 120000,
        currency: 'SAR',
        status: 'Draft',
        validUntil: new Date('2024-08-15'),
        createdAt: new Date('2024-06-25'),
      },
    ],
    skipDuplicates: true,
  });

  console.log('Proposals seeded');

  // Seed Tickets
  await prisma.ticket.createMany({
    data: [
      {
        title: 'Late delivery inquiry',
        description: 'Our last order #12345 was delayed. Can we get an update?',
        status: 'Open',
        type: 'Support',
        userId: retailer1.id,
        userType: 'Retailer',
        createdAt: new Date('2024-06-28'),
      },
      {
        title: 'API for inventory management',
        description: 'It would be great if vendors could integrate their inventory system via an API.',
        status: 'In Progress',
        type: 'Feature Request',
        userId: vendor1.id,
        userType: 'Vendor',
        createdAt: new Date('2024-06-25'),
      },
    ],
    skipDuplicates: true,
  });

  console.log('Tickets seeded');

  // Seed Activities
  await prisma.activity.createMany({
    data: [
      {
        text: "New lead 'Modern Grocers' was added.",
        timestamp: BigInt(Date.now() - 1000 * 60 * 5),
        icon: 'user-plus',
      },
      {
        text: "Proposal sent to 'City Mart'.",
        timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 2),
        icon: 'envelope',
      },
      {
        text: "Deal 'Q3 Dates Supply' was won!",
        timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 24),
        icon: 'clipboard',
      },
    ],
    skipDuplicates: true,
  });

  console.log('Activities seeded');

  // Seed User Profile
  await prisma.userProfile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      fullName: 'Sales Manager',
      email: 'manager@qawafel.com',
      phone: '555-0000',
    },
  });

  console.log('User Profile seeded');

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
