'use server';

import prisma from '@/lib/prisma';

export async function getEventAnnouncements(eventId: string) {
  return prisma.announcement.findMany({
    where: {
      eventId,
      published: true,
    },
    orderBy: [
      { pinned: 'desc' },
      { createdAt: 'desc' },
    ],
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
}

