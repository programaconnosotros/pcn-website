import { fetchTalks } from './fetch-talks';
import { prismaMock } from '@/test/prisma';
import { requireEventManager } from '@/lib/event-access';

// Event managers only: every test runs as one unless it says otherwise.
jest.mock('@/lib/event-access', () => ({ requireEventManager: jest.fn() }));

const talks = [
  { id: 'talk-1', title: 'Talk One', order: 0, createdAt: new Date('2025-01-01'), speakers: [] },
  { id: 'talk-2', title: 'Talk Two', order: 1, createdAt: new Date('2025-01-02'), speakers: [] },
];

describe('fetchTalks', () => {
  it("returns the event's talks with the speakers' phones for its managers", async () => {
    prismaMock.talk.findMany.mockResolvedValue(talks as any);

    const result = await fetchTalks('event-1');

    expect(result).toEqual(talks);
    expect(requireEventManager).toHaveBeenCalledWith('event-1');
    expect(prismaMock.talk.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { eventId: 'event-1' },
        include: { speakers: { orderBy: { order: 'asc' }, omit: { speakerPhone: false } } },
      }),
    );
  });

  it('rejects anyone who does not manage the event', async () => {
    (requireEventManager as jest.Mock).mockRejectedValueOnce(new Error('No autorizado'));

    await expect(fetchTalks('event-1')).rejects.toThrow('No autorizado');
    expect(prismaMock.talk.findMany).not.toHaveBeenCalled();
  });
});
