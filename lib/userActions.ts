'use server';

import { revalidatePath } from 'next/cache';
import prisma from './prisma';
import { getSession } from './auth';

export async function updateUserProfile(data: {
  name: string;
  email: string;
}) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: data.name,
        email: data.email,
      },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

export async function updateUserPassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const session = await getSession();
  if (!session) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Only allow password update for credentials users
    if (user.provider !== 'credentials') {
      return { success: false, error: 'Cannot change password for Google users' };
    }

    if (user.password !== data.currentPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: {
        password: data.newPassword,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating password:', error);
    return { success: false, error: 'Failed to update password' };
  }
}
