'use server';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from './authOptions';
import prisma from './prisma';

export async function getSession() {
  const session = await getServerSession(authOptions);
  
  console.log('\n========================================');
  console.log('🔍 GET SESSION CALLED');
  console.log('Session exists:', !!session);
  console.log('Session.user exists:', !!session?.user);
  
  if (session?.user) {
    console.log('Session.user:', JSON.stringify(session.user, null, 2));
  }
  
  if (!session?.user) {
    console.log('❌ No session or user - returning null');
    console.log('========================================\n');
    return null;
  }
  
  const user = session.user as {
    id?: string;
    email?: string | null;
    name?: string | null;
    role?: string;
    image?: string | null;
  };
  
  const result = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    image: user.image,
  };
  
  console.log('✅ Returning session:', result);
  console.log('========================================\n');
  
  return result;
}

export async function requireAuth() {
  console.log('\n========================================');
  console.log('🔐 REQUIRE AUTH CALLED');
  const session = await getSession();
  console.log('Session from getSession:', session);
  
  if (!session) {
    console.log('❌ No session - redirecting to /login');
    console.log('========================================\n');
    redirect('/login');
  }
  
  console.log('✅ Session valid - allowing access');
  console.log('========================================\n');
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    redirect('/');
  }
  return session;
}

export async function createSignupRequest(data: {
  email: string;
  name: string;
  image?: string;
}) {
  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      return { success: false, error: 'User already exists' };
    }

    // Check if signup request already exists
    const existingRequest = await prisma.signupRequest.findUnique({
      where: { email: data.email }
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return { success: false, error: 'Your signup request is pending approval' };
      } else if (existingRequest.status === 'rejected') {
        return { success: false, error: 'Your signup request was rejected' };
      }
    }

    // Create signup request
    await prisma.signupRequest.create({
      data: {
        email: data.email,
        name: data.name,
        image: data.image,
        provider: 'google',
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Signup request error:', error);
    return { success: false, error: 'Failed to create signup request' };
  }
}
