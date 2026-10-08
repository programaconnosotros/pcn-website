import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';

/** A project's page: the project, its team and its photos and videos in upload order. */
export const fetchProject = cached(
  'project',
  (id: string) =>
    prisma.project.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, image: true } },
        members: {
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { order: 'asc' },
        },
        media: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] },
      },
    }),
  { models: ['Project', 'ProjectMember', 'User', 'ProjectMedia'] },
);

export type ProjectDetail = NonNullable<Awaited<ReturnType<typeof fetchProject>>>;
