'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { findSession } from '@/lib/session';
import { consejoTarget } from '@/lib/consejo-target';
import { notifyUsers } from '@/actions/notifications/notify-users';
import { excerpt } from '@/actions/notifications/excerpt';

/** Like or unlike a consejo, published or extracted from a conversation (an `auto-` id). */
export const toggleLike = async (adviceId: string) => {
  try {
    const sessionId = (await cookies()).get('sessionId');

    if (!sessionId) throw new Error('User not authenticated');

    const session = await findSession(sessionId.value);

    if (!session) throw new Error('Session not found');

    const target = consejoTarget(adviceId);
    const existingLike = await prisma.like.findFirst({
      where: { userId: session.userId, ...target },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
    } else {
      await prisma.like.create({
        data: { userId: session.userId, ...target },
      });

      // Los consejos extraídos de las conversaciones no tienen autor en la plataforma.
      if ('adviceId' in target) {
        const advice = await prisma.advice.findUnique({
          where: { id: target.adviceId },
          select: { authorId: true, content: true },
        });
        await notifyUsers(
          [advice?.authorId],
          {
            type: 'advice_liked',
            title: 'Le gustó tu consejo',
            message: `A ${session.user.name} le gustó tu consejo "${excerpt(advice?.content ?? '')}".`,
            href: `/consejos/${adviceId}`,
            metadata: { adviceId, userId: session.userId },
          },
          session.userId,
        );
      }
    }

    // Revalidar todas las rutas relevantes
    revalidatePath('/consejos');
    revalidatePath(`/consejos/${adviceId}`);
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error in toggleLike:', error);
    throw error;
  }
};
