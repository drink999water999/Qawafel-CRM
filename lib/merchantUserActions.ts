'use server';

import { revalidatePath } from 'next/cache';
import prisma from './prisma';
import { requireAuth } from './auth';

export async function getMerchantUsers(merchantId: number) {
  try {
    await requireAuth();
    
    const mappings = await prisma.merchantUserMapping.findMany({
      where: { merchantId },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    const users = mappings.map(mapping => ({
      id: mapping.user.id,
      name: mapping.user.name,
      email: mapping.user.email,
      phone: mapping.user.phone,
      role: mapping.role,
      mappingId: mapping.id,
      createdAt: mapping.user.createdAt,
    }));
    
    return { success: true, users };
  } catch (error) {
    console.error('Error getting merchant users:', error);
    return { success: false, error: 'Failed to get merchant users' };
  }
}

export async function addMerchantUser(merchantId: number, data: { name: string; email: string; phone?: string; role?: string }) {
  try {
    await requireAuth();
    
    const phoneValue = data.phone ? BigInt(data.phone.replace(/\D/g, '')) : null;
    
    // Check if user already exists by email
    let user = await prisma.merchantUser.findUnique({
      where: { email: data.email },
    });
    
    // If user doesn't exist, create new user
    if (!user) {
      user = await prisma.merchantUser.create({
        data: {
          name: data.name,
          email: data.email,
          phone: phoneValue,
        },
      });
    }
    
    // Check if mapping already exists
    const existingMapping = await prisma.merchantUserMapping.findUnique({
      where: {
        merchantId_userId: {
          merchantId,
          userId: user.id,
        },
      },
    });
    
    if (existingMapping) {
      return { success: false, error: 'User is already associated with this merchant' };
    }
    
    // Create mapping between merchant and user
    await prisma.merchantUserMapping.create({
      data: {
        merchantId,
        userId: user.id,
        role: data.role || null,
      },
    });
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error adding merchant user:', error);
    return { success: false, error: 'Failed to add merchant user' };
  }
}

export async function removeMerchantUserMapping(mappingId: number) {
  try {
    await requireAuth();
    
    // Delete the mapping (not the user themselves)
    await prisma.merchantUserMapping.delete({
      where: { id: mappingId },
    });
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error removing merchant user mapping:', error);
    return { success: false, error: 'Failed to remove merchant user' };
  }
}

export async function deleteMerchantUser(userId: number) {
  try {
    await requireAuth();
    
    // This will also delete all mappings due to CASCADE
    await prisma.merchantUser.delete({
      where: { id: userId },
    });
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting merchant user:', error);
    return { success: false, error: 'Failed to delete merchant user' };
  }
}
