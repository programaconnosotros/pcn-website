'use server';

import prisma from '@/lib/prisma';

export const fetchEvents = () =>
  prisma.event.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: { date: 'desc' },
  });
