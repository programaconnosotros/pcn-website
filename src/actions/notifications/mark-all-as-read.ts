'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export const markAllNotificationsAsRead = async () => {
  const sessionId = cookies().get('sessionId')?.value;
  if (!sessionId) {
    throw new Error('No autorizado');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

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
