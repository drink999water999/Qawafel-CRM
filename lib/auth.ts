'use server';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from './authOptions';
import prisma from './prisma';

interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  image?: string | null;
}

export async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  
  const user = session.user as ExtendedUser;
  
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    image: user.image,
  };
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
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
