import { prismaMock } from '@/test/prisma';
import { extractedConsejos } from '@/data/consejos-extraidos';
import { getIdentityMap } from '@/lib/identity-links';
import { getConsejoDetail, listAdvises } from './consejos-server';

jest.mock('@/lib/identity-links', () => ({ getIdentityMap: jest.fn() }));

const advise = {
  id: 'adv-1',
  content: 'Practicá todos los días',
  createdAt: new Date('2025-03-01T10:00:00Z'),
  author: { id: 'u1', name: 'Ana', image: null },
  likes: [{ userId: 'u2' }],
  _count: { comments: 1 },
  comments: [{ id: 'c1', content: 'Gracias', author: { id: 'u2' }, replies: [] }],
};

describe('listAdvises', () => {
  it('lists every consejo, newest first, with likes and comment counts', async () => {
    prismaMock.advise.findMany.mockResolvedValue([advise] as any);
    const result = await listAdvises();
    expect(result[0].createdAt).toEqual(advise.createdAt);
    expect(prismaMock.advise.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
    );
  });
});

describe('getConsejoDetail', () => {
  it('returns a published consejo with its comments', async () => {
    prismaMock.advise.findUnique.mockResolvedValue(advise as any);

    const detail = await getConsejoDetail('adv-1');

    expect(detail?.consejo).toMatchObject({
      id: 'adv-1',
      content: 'Practicá todos los días',
      createdAt: '2025-03-01T10:00:00.000Z',
      likes: [{ userId: 'u2' }],
      commentCount: 1,
      source: null,
    });
    expect(detail?.comments).toEqual(advise.comments);
    expect(getIdentityMap).not.toHaveBeenCalled();
  });

  it('returns null for an unknown id', async () => {
    prismaMock.advise.findUnique.mockResolvedValue(null);
    await expect(getConsejoDetail('missing')).resolves.toBeNull();
  });

  it('returns null for an auto- id that matches no extracted consejo', async () => {
    prismaMock.advise.findUnique.mockResolvedValue(null);
    await expect(getConsejoDetail('auto-does-not-exist')).resolves.toBeNull();
  });

  it('builds an extracted consejo with its member linked to a platform user', async () => {
    const extracted = extractedConsejos[0];
    const linked = { id: 'u7', name: 'Linked', image: 'l.png' };
    (getIdentityMap as jest.Mock).mockResolvedValue({ [extracted.member]: linked });

    const detail = await getConsejoDetail(extracted.id);

    expect(getIdentityMap).toHaveBeenCalledWith('whatsapp');
    expect(detail).toEqual({
      consejo: expect.objectContaining({ id: extracted.id, author: linked, likes: null }),
      comments: [],
    });
    expect(prismaMock.advise.findUnique).not.toHaveBeenCalled();
  });
});
