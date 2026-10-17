import { cached } from '@/lib/cache';
import prisma from '@/lib/prisma';

/**
 * The open offers of /empleos, newest first, with who posted them. Only offers a member posted:
 * rows from before the board (seed or test data, without an author) stay out.
 */
export const listOpenJobOffers = cached(
  'job-offers',
  () =>
    prisma.jobOffers.findMany({
      where: { available: true, authorId: { not: null }, author: { deactivatedAt: null } },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { author: { select: { id: true, name: true, image: true } } },
    }),
  { models: ['JobOffers', 'User'] },
);

export type JobOfferWithAuthor = Awaited<ReturnType<typeof listOpenJobOffers>>[number];
