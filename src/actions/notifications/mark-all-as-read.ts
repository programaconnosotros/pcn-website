'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { findSession } from '@/lib/session';

export const markAllNotificationsAsRead = async () => {
  const sessionId = (await cookies()).get('sessionId')?.value;
  if (!sessionId) {
    throw new Error('No autorizado');
  }

  const session = await findSession(sessionId);

  if (!session) {
    throw new Error('No autorizado');
  }

  await prisma.notification.updateMany({
    where: {
      userId: session.userId,
      read: false,
    },
    data: {
      read: true,
    },
  });

  revalidatePath('/notificaciones');
};
