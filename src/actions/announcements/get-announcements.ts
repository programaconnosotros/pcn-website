'use server';

import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';

export const fetchAnnouncements = async () => listPublishedAnnouncements();

const listPublishedAnnouncements = cached(
  'published-announcements',
  () =>
    prisma.announcement.findMany({
      where: { published: true },
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

export const fetchAllAnnouncements = async () =>
  prisma.announcement.findMany({
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
  });
