'use server';

import prisma from '@/lib/prisma';

export const fetchPublicTalks = async () =>
  prisma.talk.findMany({
    include: { event: { select: { date: true, placeName: true, city: true } } },
    orderBy: [{ event: { date: 'desc' } }, { createdAt: 'desc' }],
  });
