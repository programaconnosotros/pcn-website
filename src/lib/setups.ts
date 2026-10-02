import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

export const setupSelect = {
  id: true,
  title: true,
  description: true,
  imageUrl: true,
  thumbUrl: true,
  width: true,
  height: true,
  createdAt: true,
  author: { select: { id: true, name: true, image: true } },
  likes: { select: { userId: true } },
} satisfies Prisma.SetupSelect;

export type SetupWithAuthor = Prisma.SetupGetPayload<{ select: typeof setupSelect }>;

export type SetupSort = 'recientes' | 'populares';

export const parseSetupSort = (value: unknown): SetupSort =>
  value === 'populares' ? 'populares' : 'recientes';

export const fetchSetups = (sort: SetupSort = 'recientes') =>
  prisma.setup.findMany({
    select: setupSelect,
    orderBy:
      sort === 'populares'
        ? [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }]
        : { createdAt: 'desc' },
  });

export const fetchSetup = (id: string) =>
  prisma.setup.findUnique({ where: { id }, select: setupSelect });
