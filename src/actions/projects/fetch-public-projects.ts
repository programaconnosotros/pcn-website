'use server';

import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';

export const fetchPublicProjects = async () => listPublicProjects();

const listPublicProjects = cached(
  'public-projects',
  async () => {
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
  },
  { models: ['Project', 'ProjectMember', 'User'] },
);
