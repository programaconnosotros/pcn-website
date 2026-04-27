'use server';

import prisma from '@/lib/prisma';

export const fetchTalks = async (eventId?: string) => {
  return prisma.talk.findMany({
    where: eventId ? { eventId } : undefined,
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });
};
