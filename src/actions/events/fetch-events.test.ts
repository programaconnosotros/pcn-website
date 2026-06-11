import { prismaMock } from '@/test/prisma';
import { fetchEvents } from './fetch-events';

const mockEvent = {
  id: 'event-1',
  name: 'Tech Talk',
  date: new Date('2026-08-15'),
  deletedAt: null,
  _count: { registrations: 5 },
};

describe('fetchEvents', () => {
  it('returns the list of events from prisma', async () => {
    prismaMock.event.findMany.mockResolvedValue([mockEvent] as any);

    const result = await fetchEvents();

    expect(result).toEqual([mockEvent]);
    expect(prismaMock.event.findMany).toHaveBeenCalledTimes(1);
  });

  it('returns an empty array when there are no events', async () => {
    prismaMock.event.findMany.mockResolvedValue([]);

    const result = await fetchEvents();

    expect(result).toEqual([]);
  });
});
