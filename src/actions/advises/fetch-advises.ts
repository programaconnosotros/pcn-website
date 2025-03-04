'use server';

import { ADVISES_PER_PAGE } from '@/lib/constants';
import prisma from '@/lib/prisma';

export const fetchAdvises = async (page: number) =>
  prisma.advise.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: ADVISES_PER_PAGE,
    skip: (page - 1) * ADVISES_PER_PAGE,
  });
