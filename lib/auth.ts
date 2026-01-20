'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from './prisma';

export async function login(email: string, password: string) {
  try {
    // Find user in database by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        password: true,
        role: true,
        approved: true,
        provider: true,
      },
    });

    console.log('Login attempt for:', email);
    console.log('User found:', user ? 'Yes' : 'No');

    // Check if user exists and password matches
    if (!user || user.password !== password) {
      console.log('Login failed - Invalid credentials');
      return { success: false, error: 'Invalid email or password' };
    }

    // Check if user is approved
    if (!user.approved) {
      return { success: false, error: 'Your account is pending approval by an administrator' };
    }

    console.log('Login successful for:', email);

    // Create session
    const cookieStore = await cookies();
    cookieStore.set('session', JSON.stringify({ 
      userId: user.id, 
      email: user.email,
      name: user.name,
      role: user.role 
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Database connection failed. Make sure your database is running.' };
  }
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

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/login');
}

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie) {
      return null;
    }

    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
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
