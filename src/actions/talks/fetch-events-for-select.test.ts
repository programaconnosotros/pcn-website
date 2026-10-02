import { fetchEventsForSelect } from './fetch-events-for-select';
import { prismaMock } from '@/test/prisma';

const events = [
  {
    id: 'event-1',
    name: 'Event One',
    date: new Date('2025-06-01'),
    placeName: 'Venue A',
    city: 'Buenos Aires',
    isOnline: false,
  },
  {
    id: 'event-2',
    name: 'Event Two',
    date: new Date('2025-01-01'),
    placeName: null,
    city: 'Córdoba',
    isOnline: true,
  },
];

describe('fetchEventsForSelect', () => {
  it('returns events ordered by date descending', async () => {
    prismaMock.event.findMany.mockResolvedValue(events as any);

    const result = await fetchEventsForSelect();

    expect(result).toEqual(events);
    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null },
        orderBy: { date: 'desc' },
      }),
    );
  });

  it('returns an empty array when no events exist', async () => {
    prismaMock.event.findMany.mockResolvedValue([]);

    const result = await fetchEventsForSelect();

    expect(result).toEqual([]);
  });
});
