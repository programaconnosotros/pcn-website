import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';

/** Every place of /lugares, newest first, with who added it. */
export const listWorkPlaces = cached(
  'work-places',
  () =>
    prisma.workPlace.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { id: true, name: true, image: true } } },
    }),
  { models: ['WorkPlace', 'User'] },
);

export type WorkPlaceWithAuthor = Awaited<ReturnType<typeof listWorkPlaces>>[number];
