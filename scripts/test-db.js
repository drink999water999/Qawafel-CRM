// Run this with: node scripts/test-db.js
// This will check if your database is properly set up

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDatabase() {
  console.log('🔍 Testing database connection...\n');

  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // Check if users table exists
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ Users table exists (${userCount} users found)\n`);

      // Check if admin user exists
      const adminUser = await prisma.user.findUnique({
        where: { email: 'mohamed.hussein@qawafel.sa' }
      });

      if (adminUser) {
        console.log('✅ Admin user found:');
        console.log(`   Email: ${adminUser.email}`);
        console.log(`   Name: ${adminUser.name || 'N/A'}`);
        console.log(`   Role: ${adminUser.role}`);
        console.log(`   Approved: ${adminUser.approved}`);
        console.log(`   Provider: ${adminUser.provider}`);
        console.log(`   Has Password: ${adminUser.password ? 'Yes' : 'No'}\n`);

        if (!adminUser.approved) {
          console.log('⚠️  WARNING: Admin user is not approved!');
          console.log('   Run: npx prisma db seed\n');
        }
      } else {
        console.log('❌ Admin user NOT found');
        console.log('   Run: npx prisma db seed\n');
      }
    } catch (error) {
      console.log('❌ Users table not found or has wrong schema');
      console.log('   Run: npx prisma db push\n');
      console.log('Error:', error.message);
    }

    // Check if signup_requests table exists
    try {
      const requestCount = await prisma.signupRequest.count();
      console.log(`✅ Signup requests table exists (${requestCount} requests found)\n`);
    } catch (error) {
      console.log('❌ Signup requests table not found');
      console.log('   Run: npx prisma db push\n');
    }

    // Test environment variables
    console.log('🔧 Checking environment variables:\n');
    
    const requiredVars = {
      'DATABASE_URL': process.env.DATABASE_URL,
      'NEXTAUTH_URL': process.env.NEXTAUTH_URL,
      'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET,
    };

    const optionalVars = {
      'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID,
      'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET,
    };

    console.log('Required variables:');
    for (const [key, value] of Object.entries(requiredVars)) {
      if (value) {
        console.log(`   ✅ ${key}: Set`);
      } else {
        console.log(`   ❌ ${key}: NOT SET (REQUIRED!)`);
      }
    }

    console.log('\nOptional variables (for Google OAuth):');
    for (const [key, value] of Object.entries(optionalVars)) {
      if (value) {
        console.log(`   ✅ ${key}: Set`);
      } else {
        console.log(`   ⚠️  ${key}: Not set (optional)`);
      }
    }

    console.log('\n✅ Database test complete!\n');
    
    if (!requiredVars.NEXTAUTH_SECRET) {
      console.log('⚠️  IMPORTANT: Generate NEXTAUTH_SECRET with:');
      console.log('   openssl rand -base64 32\n');
    }

  } catch (error) {
    console.log('❌ Database connection failed!');
    console.log('Error:', error.message);
    console.log('\nCheck your DATABASE_URL in .env.local\n');
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
