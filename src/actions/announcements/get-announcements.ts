'use server';

import prisma from '@/lib/prisma';

export const fetchAnnouncements = () =>
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
  });

export const fetchAllAnnouncements = () =>
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
