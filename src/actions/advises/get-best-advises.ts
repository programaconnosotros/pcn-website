'use server';

import prisma from '@/lib/prisma';

export const getBestAdvises = async () => {
  const bestAdvises = await prisma.advise.findMany({
    include: {
      likes: true,
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
      likes: {
        _count: 'desc',
      },
    },
    take: 2,
  });

  return bestAdvises;
};
