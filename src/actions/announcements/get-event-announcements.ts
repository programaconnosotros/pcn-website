'use server';

import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';

export async function getEventAnnouncements(eventId: string) {
  return listEventAnnouncements(eventId);
}

const listEventAnnouncements = cached(
  'event-announcements',
  (eventId: string) =>
    prisma.announcement.findMany({
      where: {
        eventId,
        published: true,
      },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    }),
  { models: ['Announcement', 'User'] },
);
