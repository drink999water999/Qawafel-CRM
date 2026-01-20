import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'mohamed.hussein@qawafel.sa' }
    });

    if (!user) {
      return NextResponse.json({
        status: 'error',
        message: 'Admin user NOT found',
        fix: 'Run: npx prisma db seed'
      }, { status: 404 });
    }

    return NextResponse.json({
      status: 'success',
      user: {
        email: user.email,
        password: user.password,
        approved: user.approved,
        role: user.role,
        hasPassword: !!user.password
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: errorMessage,
      fix: 'Check DATABASE_URL in .env.local'
    }, { status: 500 });
  }
}
