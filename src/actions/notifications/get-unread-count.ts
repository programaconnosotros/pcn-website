'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { findSession } from '@/lib/session';

export const getUnreadNotificationsCount = async (): Promise<number> => {
  const sessionId = (await cookies()).get('sessionId')?.value;
  if (!sessionId) {
    return 0;
  }

  const session = await findSession(sessionId);

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
