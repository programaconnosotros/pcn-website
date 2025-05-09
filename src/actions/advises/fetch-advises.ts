'use server';

import { ADVISES_PER_PAGE } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { Advise } from './get-advise';

export const fetchAdvises = async (page: number): Promise<Advise[]> => {
  const advises = await prisma.advise.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      likes: {
        select: {
          userId: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: ADVISES_PER_PAGE,
    skip: (page - 1) * ADVISES_PER_PAGE,
  });

  return advises.map((advise) => ({
    id: advise.id,
    content: advise.content,
    createdAt: advise.createdAt,
    author: advise.author,
    likes: advise.likes,
  }));
};
