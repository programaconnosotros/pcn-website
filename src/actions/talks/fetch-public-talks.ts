'use server';

import prisma from '@/lib/prisma';

/** Every talk (or only the ones of `eventId`), newest first. */
export const fetchPublicTalks = async (eventId?: string) => {
  const talks = await prisma.talk.findMany({
    where: eventId ? { eventId } : undefined,
    include: {
      event: {
        select: { id: true, name: true, date: true, placeName: true, city: true, isOnline: true },
      },
      speakers: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: [{ createdAt: 'desc' }],
  });

  return talks.sort((a, b) => {
    const aDate = a.event?.date ?? a.manualEventDate;
    const bDate = b.event?.date ?? b.manualEventDate;

    if (aDate && bDate) {
      return bDate.getTime() - aDate.getTime();
    }

    if (aDate) return -1;
    if (bDate) return 1;

    return b.createdAt.getTime() - a.createdAt.getTime();
  });
};
