'use server';

import prisma from '@/lib/prisma';

export const fetchPublicProjects = async () => {
  return prisma.project.findMany({
    include: {
      members: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  });
};
