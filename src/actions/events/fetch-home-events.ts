'use server';

import prisma from '@/lib/prisma';

const include = {
  _count: { select: { registrations: { where: { cancelledAt: null } } } },
} as const;

/**
 * The events the home's billboard shows: the upcoming ones first (soonest first), then the
 * latest that already happened to fill the remaining slots. An event still running counts as
 * upcoming until its end.
 */
export const fetchHomeEvents = async (slots = 3) => {
  const now = new Date();
  const startOfToday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const upcoming = await prisma.event.findMany({
    where: {
      deletedAt: null,
      OR: [
        { date: { gte: now } },
        { endDate: { gte: now } },
        { endDate: null, date: { gte: startOfToday } },
      ],
    },
    orderBy: { date: 'asc' },
    take: slots,
    include,
  });
  const past =
    upcoming.length < slots
      ? await prisma.event.findMany({
          where: {
            deletedAt: null,
            id: { notIn: upcoming.map(({ id }) => id) },
            date: { lt: now },
          },
          orderBy: { date: 'desc' },
          take: slots - upcoming.length,
          include,
        })
      : [];
  return { upcoming, past };
};

export type HomeEvent = Awaited<ReturnType<typeof fetchHomeEvents>>['upcoming'][number];
