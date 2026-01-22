'use server';

import { revalidatePath } from 'next/cache';
import prisma from './prisma';
import { getSession } from './auth';

export async function getNotes(entityType: 'lead' | 'customer' | 'merchant', entityId: number) {
  try {
    const where: {
      leadId?: number;
      customerId?: number;
      merchantId?: number;
    } = {};
    
    if (entityType === 'lead') {
      where.leadId = entityId;
    } else if (entityType === 'customer') {
      where.customerId = entityId;
    } else if (entityType === 'merchant') {
      where.merchantId = entityId;
    }

    const notes = await prisma.note.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, notes };
  } catch (error) {
    console.error('Error fetching notes:', error);
    return { success: false, error: 'Failed to fetch notes' };
  }
}

export async function addNote(
  entityType: 'lead' | 'customer' | 'merchant',
  entityId: number,
  content: string
) {
  const session = await getSession();
  
  if (!session || !session.userId) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const data: {
      content: string;
      userId: string;
      userName: string;
      entityType: string; // NEW: Added entityType
      leadId?: number;
      customerId?: number;
      merchantId?: number;
    } = {
      content,
      userId: session.userId,
      userName: session.name || session.email || 'Unknown User',
      entityType, // NEW: Set entityType
    };

    if (entityType === 'lead') {
      data.leadId = entityId;
    } else if (entityType === 'customer') {
      data.customerId = entityId;
    } else if (entityType === 'merchant') {
      data.merchantId = entityId;
    }

    const note = await prisma.note.create({
      data,
    });

    revalidatePath('/');
    return { success: true, note };
  } catch (error) {
    console.error('Error adding note:', error);
    return { success: false, error: 'Failed to add note' };
  }
}

export async function deleteNote(noteId: number) {
  const session = await getSession();
  
  if (!session) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    await prisma.note.delete({
      where: { id: noteId },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting note:', error);
    return { success: false, error: 'Failed to delete note' };
  }
}
