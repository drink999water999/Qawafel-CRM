const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDatabase() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 TESTING DATABASE CONNECTION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

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
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   Email:', adminUser.email);
        console.log('   Password:', adminUser.password);
        console.log('   Name:', adminUser.name || 'N/A');
        console.log('   Username:', adminUser.username || 'N/A');
        console.log('   Role:', adminUser.role);
        console.log('   Approved:', adminUser.approved);
        console.log('   Provider:', adminUser.provider);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        if (!adminUser.approved) {
          console.log('❌ WARNING: Admin user is not approved!');
          console.log('   FIX: Run: npx prisma db seed\n');
        }

        if (!adminUser.password) {
          console.log('❌ WARNING: Admin user has no password!');
          console.log('   FIX: Run: npx prisma db seed\n');
        }

        if (adminUser.password && adminUser.password !== 'admin') {
          console.log('⚠️  NOTE: Password is NOT "admin"');
          console.log('   Current password:', adminUser.password);
          console.log('   Expected: admin');
          console.log('   FIX: Run: npx prisma db seed\n');
        }

        if (adminUser.approved && adminUser.password === 'admin') {
          console.log('✅ Admin user is correctly configured!');
          console.log('   Login with:');
          console.log('   Email: mohamed.hussein@qawafel.sa');
          console.log('   Password: admin\n');
        }
      } else {
        console.log('❌ Admin user NOT found');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   Email should be: mohamed.hussein@qawafel.sa');
        console.log('   FIX: Run: npx prisma db seed\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      }

      // Show all users
      if (userCount > 0) {
        console.log('📋 All users in database:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const allUsers = await prisma.user.findMany({
          select: {
            email: true,
            password: true,
            approved: true,
            role: true
          }
        });
        allUsers.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email}`);
          console.log(`      Password: ${user.password || '(none)'}`);
          console.log(`      Approved: ${user.approved}`);
          console.log(`      Role: ${user.role}`);
        });
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      }
    } catch (error) {
      console.log('❌ Users table not found or has wrong schema');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('   FIX: Run: npx prisma db push\n');
      console.log('   Error:', error.message);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    // Check if signup_requests table exists
    try {
      const requestCount = await prisma.signupRequest.count();
      console.log(`✅ Signup requests table exists (${requestCount} requests found)\n`);
    } catch (error) {
      console.log('❌ Signup requests table not found');
      console.log('   FIX: Run: npx prisma db push\n');
    }

    // Test environment variables
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 ENVIRONMENT VARIABLES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const envVars = {
      'DATABASE_URL': !!process.env.DATABASE_URL,
      'NEXTAUTH_URL': !!process.env.NEXTAUTH_URL,
      'NEXTAUTH_SECRET': !!process.env.NEXTAUTH_SECRET,
      'GOOGLE_CLIENT_ID': !!process.env.GOOGLE_CLIENT_ID,
      'GOOGLE_CLIENT_SECRET': !!process.env.GOOGLE_CLIENT_SECRET,
    };

    console.log('Required (must be set):');
    ['DATABASE_URL', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET'].forEach(key => {
      const isSet = envVars[key];
      console.log(`   ${isSet ? '✅' : '❌'} ${key}: ${isSet ? 'Set' : 'NOT SET'}`);
    });

    console.log('\nOptional (for Google OAuth):');
    ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'].forEach(key => {
      const isSet = envVars[key];
      console.log(`   ${isSet ? '✅' : '⚠️ '} ${key}: ${isSet ? 'Set' : 'Not set (Google login disabled)'}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DATABASE TEST COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const allGood = (
      envVars.DATABASE_URL &&
      envVars.NEXTAUTH_URL &&
      envVars.NEXTAUTH_SECRET
    );

    if (allGood) {
      console.log('🎉 Everything looks good!');
      console.log('\nNext steps:');
      console.log('   1. npm run dev');
      console.log('   2. Go to http://localhost:3000/login');
      console.log('   3. Login with:');
      console.log('      Email: mohamed.hussein@qawafel.sa');
      console.log('      Password: admin\n');
    } else {
      console.log('⚠️  Some issues found. Please fix them and run test:db again.\n');
    }

  } catch (error) {
    console.log('❌ DATABASE CONNECTION FAILED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Error:', error.message);
    console.log('\n🔧 TO FIX:');
    console.log('   1. Check your DATABASE_URL in .env.local');
    console.log('   2. Make sure your database is running');
    console.log('   3. Verify the connection string format:');
    console.log('      PostgreSQL: postgresql://user:password@localhost:5432/database');
    console.log('      MySQL: mysql://user:password@localhost:3306/database');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
