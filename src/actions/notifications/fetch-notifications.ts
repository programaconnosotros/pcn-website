'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { findSession } from '@/lib/session';

export const fetchNotifications = async () => {
  const sessionId = (await cookies()).get('sessionId')?.value;
  if (!sessionId) {
    return [];
  }

  const session = await findSession(sessionId);

  if (!session) {
    return [];
  }

  return prisma.notification.findMany({
    where: {
      userId: session.userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};
