import { fetchTalks } from './fetch-talks';
import { prismaMock } from '@/test/prisma';

const talks = [
  { id: 'talk-1', title: 'Talk One', order: 0, createdAt: new Date('2025-01-01'), speakers: [] },
  { id: 'talk-2', title: 'Talk Two', order: 1, createdAt: new Date('2025-01-02'), speakers: [] },
];

describe('fetchTalks', () => {
  it('returns all talks when no eventId is given', async () => {
    prismaMock.talk.findMany.mockResolvedValue(talks as any);

    const result = await fetchTalks();

    expect(result).toEqual(talks);
    expect(prismaMock.talk.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined }),
    );
  });

  it('filters talks by eventId when provided', async () => {
    const filtered = [talks[0]];
    prismaMock.talk.findMany.mockResolvedValue(filtered as any);

    const result = await fetchTalks('event-1');

    expect(result).toEqual(filtered);
    expect(prismaMock.talk.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { eventId: 'event-1' } }),
    );
  });

  it('returns an empty array when no talks exist', async () => {
    prismaMock.talk.findMany.mockResolvedValue([]);

    const result = await fetchTalks();

    expect(result).toEqual([]);
  });
});
