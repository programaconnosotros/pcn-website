'use server';

import prisma from '@/lib/prisma';
import { ADVISES_PER_PAGE } from '@/lib/constants';

export const fetchAdvises = (page: number) =>
  prisma.advise.findMany({
    include: {
      author: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: ADVISES_PER_PAGE,
    skip: (page - 1) * ADVISES_PER_PAGE,
  });
