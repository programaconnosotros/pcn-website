import { prismaMock } from '@/test/prisma';
import { getAdviseById } from './get-advise';
import { getRandomAdvise } from './get-random-advise';

const author = { id: 'u-1', name: 'Ana', image: null };
const createdAt = new Date('2025-01-01');

const advise = {
  id: 'a-1',
  content: 'Consejo',
  createdAt,
  authorId: 'u-1',
  updatedAt: createdAt,
  author,
  likes: [{ id: 'l-1', userId: 'u-2', adviseId: 'a-1' }],
};

const comment = (id: string) => ({
  id,
  content: `texto ${id}`,
  createdAt,
  author,
  extra: 'dropped',
});

describe('getAdviseById', () => {
  it('returns null when the advise does not exist', async () => {
    prismaMock.advise.findUnique.mockResolvedValue(null);

    await expect(getAdviseById('missing')).resolves.toBeNull();
    expect(prismaMock.comment.findMany).not.toHaveBeenCalled();
  });

  it('skips comments when includeComments is false', async () => {
    prismaMock.advise.findUnique.mockResolvedValue(advise as never);

    const result = await getAdviseById('a-1', { includeComments: false });

    expect(result).toEqual({
      id: 'a-1',
      content: 'Consejo',
      createdAt,
      author,
      likes: advise.likes,
    });
    expect(prismaMock.comment.findMany).not.toHaveBeenCalled();
  });

  it('includes top-level comments with their nested replies by default', async () => {
    prismaMock.advise.findUnique.mockResolvedValue(advise as never);
    prismaMock.comment.findMany.mockImplementation((async (args: {
      where: { adviseId?: string; parentCommentId: string | null };
    }) => {
      const { parentCommentId } = args.where;
      if (parentCommentId === null) return [comment('c-1'), comment('c-2')];
      if (parentCommentId === 'c-1') return [comment('r-1')];
      if (parentCommentId === 'r-1') return [comment('r-2')];
      return [];
    }) as never);

    const result = await getAdviseById('a-1');

    expect(prismaMock.comment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { adviseId: 'a-1', parentCommentId: null } }),
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
    prismaMock.advise.findUnique.mockResolvedValue(advise as never);
    prismaMock.comment.findMany.mockResolvedValue([]);

    await expect(getAdviseById('a-1', { includeComments: true })).resolves.toMatchObject({
      comments: [],
    });
  });
});

describe('getRandomAdvise', () => {
  afterEach(() => jest.restoreAllMocks());

  it('skips a random number of advises within the total count', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.75);
    prismaMock.advise.count.mockResolvedValue(4);
    prismaMock.advise.findFirst.mockResolvedValue(advise as never);

    await expect(getRandomAdvise()).resolves.toBe(advise);
    expect(prismaMock.advise.findFirst).toHaveBeenCalledWith(expect.objectContaining({ skip: 3 }));
  });

  it('returns null when there are no advises', async () => {
    prismaMock.advise.count.mockResolvedValue(0);
    prismaMock.advise.findFirst.mockResolvedValue(null);

    await expect(getRandomAdvise()).resolves.toBeNull();
    expect(prismaMock.advise.findFirst).toHaveBeenCalledWith(expect.objectContaining({ skip: 0 }));
  });
});
