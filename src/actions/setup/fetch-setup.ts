'use server';

import { ADVISES_PER_PAGE } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { Setup } from './get-setup';

export const fetchSetups = async (page: number): Promise<Setup[]> => {
  const setups = await prisma.setup.findMany({
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

  return setups.map((setup) => ({
    id: setup.id,
    title: setup.title,
    content: setup.content,
    imageUrl: setup.imageUrl,
    createdAt: setup.createdAt,
    updatedAt: setup.updatedAt,
    author: setup.author,
    likes: setup.likes,
  }));
};
