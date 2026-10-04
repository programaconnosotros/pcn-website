'use server';

import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';

const listEvents = cached(
  'events',
  () =>
    prisma.event.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: { date: 'desc' },
      include: {
        _count: {
          select: {
            registrations: { where: { cancelledAt: null } },
            galleryItems: true,
            talks: true,
          },
        },
      },
    }),
  { models: ['Event', 'EventRegistration', 'GalleryItem', 'Talk'] },
);

/** Every event that wasn't deleted, newest first, with its counts. Cached. */
export const fetchEvents = async () => listEvents();
