import { prismaMock } from '@/test/prisma';
import { fetchUpcomingEvents } from './fetch-upcoming-events';

const DAY = 86_400_000;
const event = (id: string, offsetDays: number, endOffsetDays: number | null = null) => ({
  id,
  name: `Evento ${id}`,
  date: new Date(Date.now() + offsetDays * DAY),
  endDate: endOffsetDays === null ? null : new Date(Date.now() + endOffsetDays * DAY),
});

describe('fetchUpcomingEvents', () => {
  it('returns the events that start later or are still running, without endDate', async () => {
    prismaMock.event.findMany.mockResolvedValue([
      event('past', -3),
      event('running', -1, 1),
      event('next', 2),
    ] as any);

    const result = await fetchUpcomingEvents();

    expect(result.map(({ id }) => id)).toEqual(['running', 'next']);
    expect(result[0]).not.toHaveProperty('endDate');
  });

  it('returns an empty array when there are no upcoming events', async () => {
    prismaMock.event.findMany.mockResolvedValue([event('past', -3)] as any);

    expect(await fetchUpcomingEvents()).toEqual([]);
  });

  it('keeps the first `limit` upcoming events, 5 by default', async () => {
    const events = Array.from({ length: 12 }, (_, i) => event(`e${i}`, i + 1));
    prismaMock.event.findMany.mockResolvedValue(events as any);

    expect(await fetchUpcomingEvents()).toHaveLength(5);
    expect(await fetchUpcomingEvents(10)).toHaveLength(10);
  });

  it('reads every non-deleted event in date order, so the cached list fits any moment', async () => {
    prismaMock.event.findMany.mockResolvedValue([]);

    await fetchUpcomingEvents();

    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { deletedAt: null }, orderBy: { date: 'asc' } }),
    );
  });
});
