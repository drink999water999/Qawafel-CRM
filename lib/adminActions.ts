'use server';

import { revalidatePath } from 'next/cache';
import prisma from './prisma';
import { requireAdmin } from './auth';

export async function getSignupRequests() {
  await requireAdmin();
  
  return await prisma.signupRequest.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function approveSignupRequest(id: number) {
  await requireAdmin();
  
  try {
    const request = await prisma.signupRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    // Create user
    await prisma.user.create({
      data: {
        email: request.email,
        name: request.name,
        image: request.image,
        provider: request.provider,
        role: 'user',
        approved: true,
      },
    });

    // Update request status
    await prisma.signupRequest.update({
      where: { id },
      data: { status: 'approved' },
    });

    revalidatePath('/admin/approvals');
    return { success: true };
  } catch (error) {
    console.error('Approval error:', error);
    return { success: false, error: 'Failed to approve request' };
  }
}

export async function rejectSignupRequest(id: number) {
  await requireAdmin();
  
  try {
    await prisma.signupRequest.update({
      where: { id },
      data: { status: 'rejected' },
    });

    revalidatePath('/admin/approvals');
    return { success: true };
  } catch (error) {
    console.error('Rejection error:', error);
    return { success: false, error: 'Failed to reject request' };
  }
}

export async function getUsers() {
  await requireAdmin();
  
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      role: true,
      approved: true,
      provider: true,
      createdAt: true,
    },
  });
}

export async function updateUserApproval(id: string, approved: boolean) {
  await requireAdmin();
  
  try {
    await prisma.user.update({
      where: { id },
      data: { approved },
    });

    revalidatePath('/admin/approvals');
    return { success: true };
  } catch (error) {
    console.error('Update approval error:', error);
    return { success: false, error: 'Failed to update user approval' };
  }
}

export async function updateUserRole(id: string, role: string) {
  await requireAdmin();
  
  try {
    // Validate role
    if (!['user', 'editor', 'admin'].includes(role)) {
      return { success: false, error: 'Invalid role' };
    }

    await prisma.user.update({
      where: { id },
      data: { role },
    });

    revalidatePath('/admin/approvals');
    return { success: true };
  } catch (error) {
    console.error('Update role error:', error);
    return { success: false, error: 'Failed to update user role' };
  }
}
