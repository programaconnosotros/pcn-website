'use server';

import prisma from '@/lib/prisma';

export const fetchRecentlyAddedEvents = async () =>
  prisma.event.findMany({
    where: { deletedAt: null },
    orderBy: { date: 'desc' },
    take: 3,
    include: {
      _count: {
        select: {
          registrations: { where: { cancelledAt: null } },
        },
      },
    },
  });
