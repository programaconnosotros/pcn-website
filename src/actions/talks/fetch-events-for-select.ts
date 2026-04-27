'use server';

import prisma from '@/lib/prisma';

export async function fetchEventsForSelect() {
  return prisma.event.findMany({
    where: { deletedAt: null },
    orderBy: { date: 'desc' },
    select: {
      id: true,
      name: true,
      date: true,
      placeName: true,
      city: true,
    },
  });
}
