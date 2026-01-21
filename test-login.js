// Run this to test if database is set up correctly
// node test-login.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testLogin() {
  console.log('Testing login setup...\n');
  
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: 'mohamed.hussein@qawafel.sa' }
    });

    if (!user) {
      console.log('❌ Admin user NOT found');
      console.log('Run: npx prisma db seed');
      return;
    }

    console.log('✅ Admin user found');
    console.log('ID:', user.id);
    console.log('ID type:', typeof user.id);
    console.log('Email:', user.email);
    console.log('Password:', user.password);
    console.log('Approved:', user.approved);
    console.log('Role:', user.role);
    console.log('Provider:', user.provider);

    // Check if password matches
    const testPassword = 'admin';
    const passwordMatches = user.password === testPassword;
    
    console.log('\nPassword test:');
    console.log('Expected:', testPassword);
    console.log('Actual:', user.password);
    console.log('Match:', passwordMatches ? '✅' : '❌');

    if (!passwordMatches) {
      console.log('\n⚠️  Password does not match!');
      console.log('Run: npx prisma db seed');
      return;
    }

    if (!user.approved) {
      console.log('\n⚠️  User not approved!');
      console.log('Run: npx prisma db seed');
      return;
    }

    if (typeof user.id !== 'string') {
      console.log('\n⚠️  User ID is not a string!');
      console.log('Run: npx prisma db push --force-reset');
      return;
    }

    console.log('\n✅ Everything looks good!');
    console.log('Login should work with:');
    console.log('  Email: mohamed.hussein@qawafel.sa');
    console.log('  Password: admin');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
