'use server';

import prisma from '@/lib/prisma';

export const fetchPublicProjects = async () => {
  return prisma.project.findMany({
    include: {
      author: { select: { id: true, name: true, image: true } },
      members: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });
};
