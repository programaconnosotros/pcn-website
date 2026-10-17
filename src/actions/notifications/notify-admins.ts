// Server-only helper for other server actions. Not a server action itself, so nobody can call it
// from the browser to notify the admins.

import prisma from '@/lib/prisma';

type NotificationData = {
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
};

export const notifyAdmins = async (data: NotificationData) => {
  // Obtener todos los usuarios admin
  const admins = await prisma.user.findMany({
    where: {
      role: 'ADMIN',
    },
    select: {
      id: true,
    },
  });

  // Crear notificación para cada admin
  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      type: data.type,
      title: data.title,
      message: data.message,
      userId: admin.id,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    })),
  });
};
