#!/bin/bash

echo "🔍 Checking Qawafel CRM Setup..."
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "✅ .env.local file exists"
else
    echo "❌ .env.local file NOT found"
    echo "   Create it with: cp .env.example .env.local"
    exit 1
fi

# Check if DATABASE_URL is set
if grep -q "DATABASE_URL=" .env.local; then
    echo "✅ DATABASE_URL is set"
else
    echo "❌ DATABASE_URL not set in .env.local"
    exit 1
fi

# Check if NEXTAUTH_URL is set
if grep -q "NEXTAUTH_URL=" .env.local; then
    echo "✅ NEXTAUTH_URL is set"
else
    echo "❌ NEXTAUTH_URL not set in .env.local"
    exit 1
fi

# Check if NEXTAUTH_SECRET is set
if grep -q "NEXTAUTH_SECRET=" .env.local; then
    echo "✅ NEXTAUTH_SECRET is set"
else
    echo "❌ NEXTAUTH_SECRET not set in .env.local"
    exit 1
fi

# Check if node_modules exists
if [ -d node_modules ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Dependencies not installed"
    echo "   Run: npm install"
    exit 1
fi

# Check if Prisma client is generated
if [ -d node_modules/.prisma ]; then
    echo "✅ Prisma client generated"
else
    echo "❌ Prisma client not generated"
    echo "   Run: npx prisma generate"
    exit 1
fi

echo ""
echo "📋 Setup looks good! Now run:"
echo ""
echo "1. npx prisma db push     # Update database schema"
echo "2. npx prisma db seed     # Create admin user"
echo "3. npm run test:db        # Verify database"
echo "4. npm run dev            # Start server"
echo ""
echo "Then login at http://localhost:3000/login"
echo "Email: mohamed.hussein@qawafel.sa"
echo "Password: admin"
