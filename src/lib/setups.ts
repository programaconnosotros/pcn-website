import type { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';

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

const SETUP_MODELS = ['Setup', 'SetupLike', 'User'] as const;

const listSetups = cached(
  'setups',
  (sort: SetupSort) =>
    prisma.setup.findMany({
      select: setupSelect,
      orderBy:
        sort === 'populares'
          ? [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }]
          : { createdAt: 'desc' },
    }),
  { models: SETUP_MODELS },
);

export const fetchSetups = (sort: SetupSort = 'recientes') => listSetups(sort);

export const fetchSetup = cached(
  'setup',
  (id: string) => prisma.setup.findUnique({ where: { id }, select: setupSelect }),
  { models: SETUP_MODELS },
);
