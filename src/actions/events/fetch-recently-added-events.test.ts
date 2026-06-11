import { prismaMock } from '@/test/prisma';
import { fetchRecentlyAddedEvents } from './fetch-recently-added-events';

const mockEvent = {
  id: 'event-1',
  name: 'Tech Talk',
  date: new Date('2026-08-15'),
  deletedAt: null,
  _count: { registrations: 3 },
};

describe('fetchRecentlyAddedEvents', () => {
  it('returns recently added events from prisma', async () => {
    prismaMock.event.findMany.mockResolvedValue([mockEvent] as any);

    const result = await fetchRecentlyAddedEvents();

    expect(result).toEqual([mockEvent]);
    expect(prismaMock.event.findMany).toHaveBeenCalledTimes(1);
  });

  it('returns an empty array when there are no events', async () => {
    prismaMock.event.findMany.mockResolvedValue([]);

    const result = await fetchRecentlyAddedEvents();

    expect(result).toEqual([]);
  });

  it('fetches at most 3 events', async () => {
    prismaMock.event.findMany.mockResolvedValue([]);

    await fetchRecentlyAddedEvents();

    expect(prismaMock.event.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 3 }));
  });
});
