'use server';

import prisma from '@/lib/prisma';

export const fetchEvent = (id: string) =>
  prisma.event.findFirst({
    where: {
      id: id,
      deletedAt: null,
    },
    include: {
      images: true,
      sponsors: true,
    },
  });
