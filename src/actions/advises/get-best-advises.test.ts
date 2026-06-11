import { prismaMock } from '@/test/prisma';
import { getBestAdvises } from './get-best-advises';

const mockAdvises = [
  {
    id: 'advise-1',
    content: 'El mejor consejo de todos.',
    authorId: 'user-1',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    likes: [{ id: 'like-1', userId: 'user-2', adviseId: 'advise-1', createdAt: new Date() }],
    author: { id: 'user-1', name: 'Alice', email: 'alice@example.com', image: null },
  },
  {
    id: 'advise-2',
    content: 'Otro gran consejo para la comunidad.',
    authorId: 'user-2',
    createdAt: new Date('2025-01-02'),
    updatedAt: new Date('2025-01-02'),
    likes: [],
    author: { id: 'user-2', name: 'Bob', email: 'bob@example.com', image: null },
  },
];

describe('getBestAdvises', () => {
  it('returns the top 3 advises ordered by likes count', async () => {
    prismaMock.advise.findMany.mockResolvedValue(mockAdvises as any);

    const result = await getBestAdvises();

    expect(result).toEqual(mockAdvises);
    expect(prismaMock.advise.findMany).toHaveBeenCalledWith({
      include: {
        likes: true,
        author: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: {
        likes: { _count: 'desc' },
      },
      take: 3,
    });
  });

  it('returns an empty array when there are no advises', async () => {
    prismaMock.advise.findMany.mockResolvedValue([]);

    const result = await getBestAdvises();

    expect(result).toEqual([]);
  });
});
