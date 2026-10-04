'use server';

import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';

// Every event's dates, cached: the sidebar shows the upcoming ones on every page, and which
// ones are upcoming depends on the time, so that part is worked out on each request.
const listEventDates = cached(
  'event-dates',
  () =>
    prisma.event.findMany({
      where: { deletedAt: null },
      orderBy: { date: 'asc' },
      select: { id: true, name: true, date: true, endDate: true },
    }),
  { models: ['Event'] },
);

export const fetchUpcomingEvents = async (limit: number = 5) => {
  const now = new Date();
  const events = await listEventDates();
  return events
    .filter(({ date, endDate }) => date >= now || (endDate !== null && endDate >= now))
    .slice(0, limit)
    .map(({ id, name, date }) => ({ id, name, date }));
};
