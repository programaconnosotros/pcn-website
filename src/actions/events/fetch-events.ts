'use server';

import prisma from '@/lib/prisma';

export const fetchEvents = () =>
  prisma.event.findMany({
    orderBy: { date: 'desc' },
  });
