'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from './prisma';

export async function login(username: string, password: string) {
  try {
    // Find user in database - username is already indexed as unique
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
        role: true,
      },
    });

    console.log('Login attempt for:', username);
    console.log('User found:', user ? 'Yes' : 'No');

    // Check if user exists and password matches
    if (!user || user.password !== password) {
      console.log('Login failed - Invalid credentials');
      return { success: false, error: 'Invalid username or password' };
    }

    console.log('Login successful for:', username);

    // Create session
    const cookieStore = await cookies();
    cookieStore.set('session', JSON.stringify({ 
      userId: user.id, 
      username: user.username, 
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
