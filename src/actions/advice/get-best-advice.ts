'use server';

import prisma from '@/lib/prisma';

export const getBestAdvice = async () => {
  const bestAdvice = await prisma.advice.findMany({
    include: {
      likes: true,
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      likes: {
        _count: 'desc',
      },
    },
    take: 3,
  });

  return bestAdvice;
};
