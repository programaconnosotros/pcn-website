'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { findSession } from '@/lib/session';

/** The page lists the most recent ones; the counts in its title cover them all. */
const NOTIFICATIONS_SHOWN = 200;

const notificationsFor = async () => {
  const sessionId = (await cookies()).get('sessionId')?.value;
  return sessionId ? findSession(sessionId) : null;
};

/** How many notifications the user has, and how many of them are unread. */
export const countNotifications = async () => {
  const session = await notificationsFor();
  if (!session) return { total: 0, unread: 0 };
  const [total, unread] = await Promise.all([
    prisma.notification.count({ where: { userId: session.userId } }),
    prisma.notification.count({ where: { userId: session.userId, read: false } }),
  ]);
  return { total, unread };
};

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
    take: NOTIFICATIONS_SHOWN,
  });
};
