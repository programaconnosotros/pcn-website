'use server';

import { ADVISES_PER_PAGE } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { Setup, User } from '@prisma/client';

export const fetchSetups = async (page: number): Promise<(Setup & {
  author: Pick<User, 'id' | 'name' | 'email' | 'image'>;
  likes: { userId: string }[];
})[]> => 
  prisma.setup.findMany({
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
