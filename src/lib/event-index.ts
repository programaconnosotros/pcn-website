import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';

/**
 * Every event that wasn't deleted, with just its name and dates, soonest first. Cached: the
 * sidebar shows the upcoming ones on every page and other pages look names up by id.
 */
export const listEventIndex = cached(
  'event-index',
  () =>
    prisma.event.findMany({
      where: { deletedAt: null },
      orderBy: { date: 'asc' },
      select: { id: true, name: true, date: true, endDate: true },
    }),
  { models: ['Event'] },
);

/** Event id → name, for the ones of `ids` that exist. */
export const getEventNames = async (ids: string[]) => {
  const wanted = new Set(ids);
  return Object.fromEntries(
    (await listEventIndex())
      .filter((event) => wanted.has(event.id))
      .map((event) => [event.id, event.name]),
  );
};
