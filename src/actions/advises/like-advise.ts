'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export const toggleLike = async (adviseId: string) => {
  try {
    const sessionId = await cookies().get('sessionId');

    if (!sessionId) throw new Error('User not authenticated');

    const session = await prisma.session.findUnique({
      where: { id: sessionId.value },
    });

    if (!session) throw new Error('Session not found');

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_adviseId: {
          userId: session.userId,
          adviseId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
    } else {
      await prisma.like.create({
        data: {
          userId: session.userId,
          adviseId,
        },
      });
    }

    // Revalidar todas las rutas relevantes
    revalidatePath('/consejos');
    revalidatePath(`/consejos/${adviseId}`);
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    console.error('Error in toggleLike:', error);
    throw error;
  }
};
