import { prismaMock } from '@/test/prisma';
import { getEventsForSelect } from './get-events-for-select';

const eventOption = {
  id: 'event-1',
  name: 'PCN Conference 2025',
  date: new Date('2025-06-01'),
};

describe('getEventsForSelect', () => {
  it('returns non-deleted events ordered by date descending', async () => {
    prismaMock.event.findMany.mockResolvedValue([eventOption] as any);

    const result = await getEventsForSelect();

    expect(result).toEqual([eventOption]);
    expect(prismaMock.event.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { date: 'desc' },
      select: { id: true, name: true, date: true },
    });
  });

  it('returns an empty array when there are no active events', async () => {
    prismaMock.event.findMany.mockResolvedValue([]);

    const result = await getEventsForSelect();

    expect(result).toEqual([]);
  });
});
