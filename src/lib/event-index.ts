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

/**
 * The public numbers of an event's page: active registrations (for the capacity), people on
 * the waitlist, registrations by status (for a past event's memory) and its catalog number in
 * the /eventos museum (the first event ever is Nº 001).
 */
export const getEventCounts = cached(
  'event-counts',
  async (eventId: string) => {
    const event = await prisma.event.findFirst({
      where: { id: eventId, deletedAt: null },
      select: { date: true },
    });
    const [registrations, waitlist, catalogNumber] = await Promise.all([
      prisma.eventRegistration.groupBy({ by: ['cancelledAt'], where: { eventId }, _count: true }),
      prisma.eventWaitlistEntry.count({
        where: { eventId, cancelledAt: null, promotedAt: null },
      }),
      event ? prisma.event.count({ where: { deletedAt: null, date: { lte: event.date } } }) : 0,
    ]);
    const active = registrations
      .filter((row) => row.cancelledAt === null)
      .reduce((sum, row) => sum + row._count, 0);
    const total = registrations.reduce((sum, row) => sum + row._count, 0);
    return { activeRegistrations: active, totalRegistrations: total, waitlist, catalogNumber };
  },
  { models: ['Event', 'EventRegistration', 'EventWaitlistEntry'] },
);
