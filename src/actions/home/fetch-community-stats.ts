'use server';

import prisma from '@/lib/prisma';

export interface CommunityStats {
  members: number;
  events: number;
  talks: number;
}

/**
 * Aggregate counters shown in the home hero.
 * Runs the three counts in parallel; every value is a plain integer so the
 * result can be passed straight to a client component.
 */
export const fetchCommunityStats = async (): Promise<CommunityStats> => {
  const [members, events, talks] = await Promise.all([
    prisma.user.count(),
    prisma.event.count({ where: { deletedAt: null } }),
    prisma.talk.count(),
  ]);

  return { members, events, talks };
};
