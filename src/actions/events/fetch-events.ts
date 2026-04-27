'use server';

import prisma from '@/lib/prisma';

export const fetchEvents = async () =>
  prisma.event.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: { date: 'desc' },
    include: {
      _count: {
        select: {
          registrations: { where: { cancelledAt: null } },
        },
      },
    },
  });
