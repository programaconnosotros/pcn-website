import { fetchTalkForEdit, fetchTalks } from './fetch-talks';
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

describe('fetchTalkForEdit', () => {
  const talk = { id: 'talk-1', eventId: 'event-1', speakers: [{ speakerPhone: '123' }] };

  it("returns the talk with the speakers' phones to whoever manages its event", async () => {
    prismaMock.talk.findUnique.mockResolvedValue(talk as any);

    await expect(fetchTalkForEdit('talk-1')).resolves.toEqual(talk);
    expect(requireEventManager).toHaveBeenCalledWith('event-1');
    expect(prismaMock.talk.findUnique).toHaveBeenCalledWith({
      where: { id: 'talk-1' },
      include: { speakers: { orderBy: { order: 'asc' }, omit: { speakerPhone: false } } },
    });
  });

  it('leaves talks without an event to admins', async () => {
    prismaMock.talk.findUnique.mockResolvedValue({ ...talk, eventId: null } as any);

    await fetchTalkForEdit('talk-1');

    expect(requireEventManager).toHaveBeenCalledWith(null);
  });

  it('rejects anyone who does not manage the event', async () => {
    prismaMock.talk.findUnique.mockResolvedValue(talk as any);
    (requireEventManager as jest.Mock).mockRejectedValueOnce(new Error('No autorizado'));

    await expect(fetchTalkForEdit('talk-1')).rejects.toThrow('No autorizado');
  });

  it('fails when the talk does not exist', async () => {
    prismaMock.talk.findUnique.mockResolvedValue(null);

    await expect(fetchTalkForEdit('talk-1')).rejects.toThrow('Charla no encontrada');
    expect(requireEventManager).not.toHaveBeenCalled();
  });
});
