'use server';

import prisma from '@/lib/prisma';

export const fetchUpcomingEvents = async (limit: number = 5) => {
  const now = new Date();

  return prisma.event.findMany({
    where: {
      deletedAt: null,
      OR: [{ date: { gte: now } }, { endDate: { gte: now } }],
    },
    orderBy: { date: 'asc' },
    take: limit,
    select: {
      id: true,
      name: true,
      date: true,
    },
  });
};
