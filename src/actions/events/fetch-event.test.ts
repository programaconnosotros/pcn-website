import { prismaMock } from '@/test/prisma';
import { fetchEvent } from './fetch-event';

const mockEvent = {
  id: 'event-1',
  name: 'Tech Talk',
  date: new Date('2026-08-15'),
  deletedAt: null,
  images: [],
  sponsors: [],
};

describe('fetchEvent', () => {
  it('returns the event when found', async () => {
    prismaMock.event.findFirst.mockResolvedValue(mockEvent as any);

    const result = await fetchEvent('event-1');

    expect(result).toEqual(mockEvent);
    expect(prismaMock.event.findFirst).toHaveBeenCalledTimes(1);
  });

  it('returns null when the event is not found', async () => {
    prismaMock.event.findFirst.mockResolvedValue(null);

    const result = await fetchEvent('non-existent');

    expect(result).toBeNull();
  });
});
