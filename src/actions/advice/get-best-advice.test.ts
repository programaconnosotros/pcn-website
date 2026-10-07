import { prismaMock } from '@/test/prisma';
import { getBestAdvice } from './get-best-advice';

const mockAdviceList = [
  {
    id: 'advice-1',
    content: 'El mejor consejo de todos.',
    authorId: 'user-1',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    likes: [{ id: 'like-1', userId: 'user-2', adviceId: 'advice-1', createdAt: new Date() }],
    author: { id: 'user-1', name: 'Alice', email: 'alice@example.com', image: null },
  },
  {
    id: 'advice-2',
    content: 'Otro gran consejo para la comunidad.',
    authorId: 'user-2',
    createdAt: new Date('2025-01-02'),
    updatedAt: new Date('2025-01-02'),
    likes: [],
    author: { id: 'user-2', name: 'Bob', email: 'bob@example.com', image: null },
  },
];

describe('getBestAdvice', () => {
  it('returns the top 3 advice ordered by likes count', async () => {
    prismaMock.advice.findMany.mockResolvedValue(mockAdviceList as any);

    const result = await getBestAdvice();

    expect(result).toEqual(mockAdviceList);
    expect(prismaMock.advice.findMany).toHaveBeenCalledWith({
      include: {
        likes: true,
        author: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: {
        likes: { _count: 'desc' },
      },
      take: 3,
    });
  });

  it('returns an empty array when there are no advice', async () => {
    prismaMock.advice.findMany.mockResolvedValue([]);

    const result = await getBestAdvice();

    expect(result).toEqual([]);
  });
});
