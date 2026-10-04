import { prismaMock } from '@/test/prisma';
import { fetchHomeEvents } from './fetch-home-events';

const NOW = new Date('2026-10-03T15:00:00Z'); // 12:00 in Argentina

const event = (id: string, date: string, endDate: string | null = null) => ({
  id,
  name: id,
  date: new Date(date),
  endDate: endDate ? new Date(endDate) : null,
  deletedAt: null,
  _count: { registrations: 0, galleryItems: 0, talks: 0 },
});

// fetchEvents returns them newest first.
const listed = (...events: ReturnType<typeof event>[]) =>
  prismaMock.event.findMany.mockResolvedValue(
    [...events].sort((a, b) => b.date.getTime() - a.date.getTime()) as any,
  );

describe('fetchHomeEvents', () => {
  beforeEach(() => jest.useFakeTimers({ now: NOW }));
  afterEach(() => jest.useRealTimers());

  it('fills the remaining slots with the latest past events', async () => {
    listed(
      event('next', '2026-10-10T22:00:00Z'),
      event('last', '2026-09-20T22:00:00Z'),
      event('before-last', '2026-09-01T22:00:00Z'),
      event('old', '2026-08-01T22:00:00Z'),
    );

    const { upcoming, past } = await fetchHomeEvents();

    expect(upcoming.map(({ id }) => id)).toEqual(['next']);
    expect(past.map(({ id }) => id)).toEqual(['last', 'before-last']);
  });

  it('orders upcoming events soonest first and skips past ones when they fill every slot', async () => {
    listed(
      event('c', '2026-12-01T22:00:00Z'),
      event('a', '2026-10-05T22:00:00Z'),
      event('b', '2026-11-01T22:00:00Z'),
      event('d', '2027-01-01T22:00:00Z'),
      event('last', '2026-09-20T22:00:00Z'),
    );

    const { upcoming, past } = await fetchHomeEvents();

    expect(upcoming.map(({ id }) => id)).toEqual(['a', 'b', 'c']);
    expect(past).toEqual([]);
  });

  it('keeps an event without end date until its day is over in Argentina', async () => {
    listed(
      event('this-morning', '2026-10-03T11:00:00Z'),
      event('yesterday', '2026-10-02T22:00:00Z'),
    );

    const { upcoming, past } = await fetchHomeEvents();

    expect(upcoming.map(({ id }) => id)).toEqual(['this-morning']);
    expect(past.map(({ id }) => id)).toEqual(['yesterday']);
  });

  it('keeps an event that is still running until its end', async () => {
    listed(event('running', '2026-10-01T12:00:00Z', '2026-10-05T12:00:00Z'));

    const { upcoming } = await fetchHomeEvents();

    expect(upcoming.map(({ id }) => id)).toEqual(['running']);
  });
});
