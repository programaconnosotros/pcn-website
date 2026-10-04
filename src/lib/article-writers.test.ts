import { prismaMock } from '@/test/prisma';
import { getIdentityMap } from '@/lib/identity-links';
import { getArticleWriters } from './article-writers';

jest.mock('@/lib/identity-links', () => ({ getIdentityMap: jest.fn() }));
jest.mock('@/app/(platform)/lectura/articles', () => ({
  articles: [
    { id: 'a1', author: 'Ana Pérez', coauthors: ['Beto'] },
    { id: 'a2', author: 'Desconocido' },
  ],
  articleAuthors: (article: { author: string; coauthors?: string[] }) => [
    article.author,
    ...(article.coauthors ?? []),
  ],
}));

const ana = { id: 'u1', name: 'Ana', image: null };
const beto = { id: 'u2', name: 'Beto', image: 'b.png' };
const caro = { id: 'u3', name: 'Caro', image: null };

describe('getArticleWriters', () => {
  it('lists linked authors first and then the members tagged on each article, without repeats', async () => {
    (getIdentityMap as jest.Mock).mockResolvedValue({ 'Ana Pérez': ana, Beto: beto });
    prismaMock.articleAuthor.findMany.mockResolvedValue([
      { articleId: 'a1', user: ana },
      { articleId: 'a1', user: caro },
      { articleId: 'a2', user: beto },
    ] as any);

    await expect(getArticleWriters()).resolves.toEqual({
      a1: [{ ...ana, linkedAuthor: 'Ana Pérez' }, { ...beto, linkedAuthor: 'Beto' }, caro],
      a2: [beto],
    });
    expect(getIdentityMap).toHaveBeenCalledWith('articulos');
  });

  it('is empty when no author is linked or tagged', async () => {
    (getIdentityMap as jest.Mock).mockResolvedValue({});
    prismaMock.articleAuthor.findMany.mockResolvedValue([]);
    await expect(getArticleWriters()).resolves.toEqual({});
  });
});
