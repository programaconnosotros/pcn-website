import { prismaMock } from '@/test/prisma';
import { fetchEventForEdit } from './fetch-event-for-edit';

const mockEvent = {
  id: 'event-1',
  name: 'Tech Talk',
  date: new Date('2026-08-15'),
  deletedAt: new Date('2026-01-01'),
  images: [],
  sponsors: [],
};

describe('fetchEventForEdit', () => {
  it('returns the event when found (including soft-deleted events)', async () => {
    prismaMock.event.findUnique.mockResolvedValue(mockEvent as any);

    const result = await fetchEventForEdit('event-1');

    expect(result).toEqual(mockEvent);
    expect(prismaMock.event.findUnique).toHaveBeenCalledTimes(1);
  });

  it('returns null when the event does not exist', async () => {
    prismaMock.event.findUnique.mockResolvedValue(null);

    const result = await fetchEventForEdit('non-existent');

    expect(result).toBeNull();
  });
});
