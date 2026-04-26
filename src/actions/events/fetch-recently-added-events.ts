'use server';

import prisma from '@/lib/prisma';

export const fetchRecentlyAddedEvents = () =>
  prisma.event.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: {
      _count: {
        select: {
          registrations: { where: { cancelledAt: null } },
        },
      },
    },
  });
