'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export const markNotificationAsRead = async (notificationId: string) => {
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

  // Verificar que la notificación pertenece al usuario
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.userId !== session.userId) {
    throw new Error('No tienes permisos para marcar esta notificación como leída');
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: {
      read: true,
    },
  });

  revalidatePath('/notificaciones');
};

