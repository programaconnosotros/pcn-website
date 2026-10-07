import { prismaMock } from '@/test/prisma';
import { getAdviceById } from './get-advice';
import { getRandomAdvice } from './get-random-advice';

const author = { id: 'u-1', name: 'Ana', image: null };
const createdAt = new Date('2025-01-01');

const advice = {
  id: 'a-1',
  content: 'Consejo',
  createdAt,
  authorId: 'u-1',
  updatedAt: createdAt,
  author,
  likes: [{ id: 'l-1', userId: 'u-2', adviceId: 'a-1' }],
};

const comment = (id: string) => ({
  id,
  content: `texto ${id}`,
  createdAt,
  author,
  extra: 'dropped',
});

describe('getAdviceById', () => {
  it('returns null when the advice does not exist', async () => {
    prismaMock.advice.findUnique.mockResolvedValue(null);

    await expect(getAdviceById('missing')).resolves.toBeNull();
    expect(prismaMock.comment.findMany).not.toHaveBeenCalled();
  });

  it('skips comments when includeComments is false', async () => {
    prismaMock.advice.findUnique.mockResolvedValue(advice as never);

    const result = await getAdviceById('a-1', { includeComments: false });

    expect(result).toEqual({
      id: 'a-1',
      content: 'Consejo',
      createdAt,
      author,
      likes: advice.likes,
    });
    expect(prismaMock.comment.findMany).not.toHaveBeenCalled();
  });

  it('includes top-level comments with their nested replies by default', async () => {
    prismaMock.advice.findUnique.mockResolvedValue(advice as never);
    prismaMock.comment.findMany.mockImplementation((async (args: {
      where: { adviceId?: string; parentCommentId: string | null };
    }) => {
      const { parentCommentId } = args.where;
      if (parentCommentId === null) return [comment('c-1'), comment('c-2')];
      if (parentCommentId === 'c-1') return [comment('r-1')];
      if (parentCommentId === 'r-1') return [comment('r-2')];
      return [];
    }) as never);

    const result = await getAdviceById('a-1');

    expect(prismaMock.comment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { adviceId: 'a-1', parentCommentId: null } }),
    );
    expect(result?.comments).toEqual([
      {
        id: 'c-1',
        content: 'texto c-1',
        createdAt,
        author,
        replies: [
          {
            id: 'r-1',
            content: 'texto r-1',
            createdAt,
            author,
            replies: [{ id: 'r-2', content: 'texto r-2', createdAt, author, replies: [] }],
          },
        ],
      },
      { id: 'c-2', content: 'texto c-2', createdAt, author, replies: [] },
    ]);
  });

  it('returns an empty comment list when there are none', async () => {
    prismaMock.advice.findUnique.mockResolvedValue(advice as never);
    prismaMock.comment.findMany.mockResolvedValue([]);

    await expect(getAdviceById('a-1', { includeComments: true })).resolves.toMatchObject({
      comments: [],
    });
  });
});

describe('getRandomAdvice', () => {
  afterEach(() => jest.restoreAllMocks());

  it('skips a random number of advice within the total count', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.75);
    prismaMock.advice.count.mockResolvedValue(4);
    prismaMock.advice.findFirst.mockResolvedValue(advice as never);

    await expect(getRandomAdvice()).resolves.toBe(advice);
    expect(prismaMock.advice.findFirst).toHaveBeenCalledWith(expect.objectContaining({ skip: 3 }));
  });

  it('returns null when there are no advice', async () => {
    prismaMock.advice.count.mockResolvedValue(0);
    prismaMock.advice.findFirst.mockResolvedValue(null);

    await expect(getRandomAdvice()).resolves.toBeNull();
    expect(prismaMock.advice.findFirst).toHaveBeenCalledWith(expect.objectContaining({ skip: 0 }));
  });
});
