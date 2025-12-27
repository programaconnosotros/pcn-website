'use server';

import prisma from '@/lib/prisma';

export async function getEventsForSelect() {
  const events = await prisma.event.findMany({
    where: { deletedAt: null },
    orderBy: { date: 'desc' },
    select: {
      id: true,
      name: true,
      date: true,
    },
  });

  return events;
}

