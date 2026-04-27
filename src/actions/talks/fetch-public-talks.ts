'use server';

import prisma from '@/lib/prisma';

export const fetchPublicTalks = async () =>
  prisma.talk.findMany({
    include: {
      event: { select: { date: true, placeName: true, city: true } },
      speakers: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: [{ event: { date: 'desc' } }, { createdAt: 'desc' }],
  });
