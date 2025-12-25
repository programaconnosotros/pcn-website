'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export const fetchNotifications = async () => {
  const sessionId = cookies().get('sessionId')?.value;
  if (!sessionId) {
    return [];
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

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

