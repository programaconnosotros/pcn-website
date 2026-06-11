import { prismaMock } from '@/test/prisma';
import { fetchTalkProposals } from './fetch-talk-proposals';

const mockProposals = [
  {
    id: 'proposal-1',
    eventId: 'event-1',
    userId: 'user-1',
    title: 'Charla sobre React',
    description: 'Una introducción a React',
    status: 'PENDING',
    createdAt: new Date('2025-06-01'),
    updatedAt: new Date('2025-06-01'),
    talk: null,
    speakers: [],
  },
  {
    id: 'proposal-2',
    eventId: 'event-1',
    userId: 'user-2',
    title: 'Testing con Jest',
    description: 'Cómo hacer unit tests en Next.js',
    status: 'APPROVED',
    createdAt: new Date('2025-06-02'),
    updatedAt: new Date('2025-06-02'),
    talk: { id: 'talk-1' },
    speakers: [],
  },
];

describe('fetchTalkProposals', () => {
  it('returns proposals for the given event ordered by createdAt desc', async () => {
    prismaMock.talkProposal.findMany.mockResolvedValue(mockProposals as any);

    const result = await fetchTalkProposals('event-1');

    expect(result).toEqual(mockProposals);
    expect(prismaMock.talkProposal.findMany).toHaveBeenCalledWith({
      where: { eventId: 'event-1' },
      orderBy: { createdAt: 'desc' },
      include: {
        talk: { select: { id: true } },
        speakers: { orderBy: { order: 'asc' } },
      },
    });
  });

  it('returns an empty array when there are no proposals for the event', async () => {
    prismaMock.talkProposal.findMany.mockResolvedValue([]);

    const result = await fetchTalkProposals('event-empty');

    expect(result).toEqual([]);
    expect(prismaMock.talkProposal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { eventId: 'event-empty' } }),
    );
  });
});
