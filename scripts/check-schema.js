const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSchema() {
  console.log('\n🔍 Checking database schema...\n');
  
  try {
    // Try to get a user
    const user = await prisma.user.findFirst();
    
    if (user) {
      console.log('✅ Users table exists');
      console.log('   User ID type:', typeof user.id);
      console.log('   User ID value:', user.id);
      
      if (typeof user.id === 'string') {
        console.log('   ✅ ID is String (CORRECT - migration done)');
      } else {
        console.log('   ❌ ID is Number (WRONG - migration NOT done)');
        console.log('\n⚠️  YOU MUST RUN: npx prisma migrate reset --force\n');
      }
    } else {
      console.log('⚠️  No users found');
      console.log('   Run: npx prisma db seed\n');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('\n⚠️  Schema not compatible. Run: npx prisma migrate reset --force\n');
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();
