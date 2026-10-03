'use server';

import prisma from '@/lib/prisma';

const TIME_ZONE = 'America/Argentina/Buenos_Aires';

/** Midnight of today in Argentina (UTC-3, no DST), when an event without an end date expires. */
const startOfTodayIn = (now: Date) =>
  new Date(
    `${new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(now)}T00:00:00-03:00`,
  );

const include = {
  _count: { select: { registrations: { where: { cancelledAt: null } } } },
} as const;

/**
 * The events the home's billboard shows: the upcoming ones first (soonest first), then the
 * latest that already happened to fill the remaining slots. An event still running counts as
 * upcoming until its end, or until the end of its day (in Argentina) when it has none.
 */
export const fetchHomeEvents = async (slots = 3) => {
  const now = new Date();
  const startOfToday = startOfTodayIn(now);
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
