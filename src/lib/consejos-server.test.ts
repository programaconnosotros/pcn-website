import { prismaMock } from '@/test/prisma';
import { extractedConsejos } from '@/data/consejos-extraidos';
import { getIdentityMap } from '@/lib/identity-links';
import { getConsejoDetail, listAdvice, listExtractedActivity } from './consejos-server';

jest.mock('@/lib/identity-links', () => ({ getIdentityMap: jest.fn() }));

const advice = {
  id: 'adv-1',
  content: 'Practicá todos los días',
  createdAt: new Date('2025-03-01T10:00:00Z'),
  author: { id: 'u1', name: 'Ana', image: null },
  likes: [{ userId: 'u2' }],
  _count: { comments: 1 },
  comments: [{ id: 'c1', content: 'Gracias', author: { id: 'u2' }, replies: [] }],
};

beforeEach(() => {
  prismaMock.like.findMany.mockResolvedValue([]);
  jest.mocked(prismaMock.comment.groupBy as jest.Mock).mockResolvedValue([] as never);
  prismaMock.comment.findMany.mockResolvedValue([]);
});

describe('listExtractedActivity', () => {
  it('groups the likes and comment counts of extracted consejos by id', async () => {
    prismaMock.like.findMany.mockResolvedValue([
      { userId: 'u1', extractedId: 'auto-a' },
      { userId: 'u2', extractedId: 'auto-a' },
      { userId: 'u1', extractedId: 'auto-b' },
    ] as never);
    jest.mocked(prismaMock.comment.groupBy as jest.Mock).mockResolvedValue([
      { extractedId: 'auto-b', _count: { _all: 3 } },
      { extractedId: 'auto-c', _count: { _all: 1 } },
    ] as never);

    expect(await listExtractedActivity()).toEqual({
      'auto-a': { likes: [{ userId: 'u1' }, { userId: 'u2' }], commentCount: 0 },
      'auto-b': { likes: [{ userId: 'u1' }], commentCount: 3 },
      'auto-c': { likes: [], commentCount: 1 },
    });
  });
});

describe('listAdvice', () => {
  it('lists every consejo, newest first, with likes and comment counts', async () => {
    prismaMock.advice.findMany.mockResolvedValue([advice] as any);
    const result = await listAdvice();
    expect(result[0].createdAt).toEqual(advice.createdAt);
    expect(prismaMock.advice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
    );
  });
});

describe('getConsejoDetail', () => {
  it('returns a published consejo with its comments', async () => {
    prismaMock.advice.findUnique.mockResolvedValue(advice as any);

    const detail = await getConsejoDetail('adv-1');

    expect(detail?.consejo).toMatchObject({
      id: 'adv-1',
      content: 'Practicá todos los días',
      createdAt: '2025-03-01T10:00:00.000Z',
      likes: [{ userId: 'u2' }],
      commentCount: 1,
      source: null,
    });
    expect(detail?.comments).toEqual(advice.comments);
    expect(getIdentityMap).not.toHaveBeenCalled();
  });

  it('returns null for an unknown id', async () => {
    prismaMock.advice.findUnique.mockResolvedValue(null);
    await expect(getConsejoDetail('missing')).resolves.toBeNull();
  });

  it('returns null for an auto- id that matches no extracted consejo', async () => {
    prismaMock.advice.findUnique.mockResolvedValue(null);
    await expect(getConsejoDetail('auto-does-not-exist')).resolves.toBeNull();
  });

  it('builds an extracted consejo with its member linked to a platform user', async () => {
    const extracted = extractedConsejos[0];
    const linked = { id: 'u7', name: 'Linked', image: 'l.png' };
    (getIdentityMap as jest.Mock).mockResolvedValue({ [extracted.member]: linked });
    prismaMock.like.findMany.mockResolvedValue([
      { userId: 'u2', extractedId: extracted.id },
    ] as never);
    jest
      .mocked(prismaMock.comment.groupBy as jest.Mock)
      .mockResolvedValue([{ extractedId: extracted.id, _count: { _all: 1 } }] as never);
    const comments = [{ id: 'c9', content: 'Buenísimo', replies: [] }];
    prismaMock.comment.findMany.mockResolvedValue(comments as never);

    const detail = await getConsejoDetail(extracted.id);

    expect(getIdentityMap).toHaveBeenCalledWith('whatsapp');
    expect(detail).toEqual({
      consejo: expect.objectContaining({
        id: extracted.id,
        author: linked,
        likes: [{ userId: 'u2' }],
        commentCount: 1,
      }),
      comments,
    });
    expect(prismaMock.comment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { extractedId: extracted.id, parentCommentId: null } }),
    );
    expect(prismaMock.advice.findUnique).not.toHaveBeenCalled();
  });
});
