'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export const toggleLikeSetup = async (setupId: string) => {
  try {
    const sessionId = await cookies().get('sessionId');

    if (!sessionId) throw new Error('User not authenticated');

    const session = await prisma.session.findUnique({
      where: { id: sessionId.value },
    });

    if (!session) throw new Error('Session not found');

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_setupId: {
          userId: session.userId,
          setupId,
        },
      },
    });

    if (existingLike) {
      console.log('existingLike', existingLike);
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
    } else {
      console.log('no existingLike');
      await prisma.like.create({
        data: {
          userId: session.userId,
          setupId,
        },
      });
    }

    // Revalidar todas las rutas relevantes
    revalidatePath('/setup');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error in toggleLike:', error);
    throw error;
  }
};
