'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export const getUnreadNotificationsCount = async (): Promise<number> => {
  const sessionId = cookies().get('sessionId')?.value;
  if (!sessionId) {
    return 0;
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.user.role !== 'ADMIN') {
    return 0;
  }

  return prisma.notification.count({
    where: {
      userId: session.userId,
      read: false,
    },
  });
};

