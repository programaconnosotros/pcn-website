import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { articles } from '@/app/(platform)/lectura/articles';
import { addArticleAuthor, removeArticleAuthor } from './article-authors';

const admin = { id: 'admin-1', role: 'ADMIN' as const };
const regular = { id: 'user-1', role: 'REGULAR' as const };

const loginAs = (user: { id: string }) => {
  mockCookies({ sessionId: `session-${user.id}` });
  prismaMock.session.findUnique.mockResolvedValue({ id: 's', userId: user.id, user } as any);
};

const articleId = articles[0].id;

describe('article authors', () => {
  it('only lets admins pick the writers', async () => {
    loginAs(regular);

    await expect(addArticleAuthor(articleId, 'user-1')).rejects.toThrow('No autorizado');
    await expect(removeArticleAuthor(articleId, 'user-1')).rejects.toThrow('No autorizado');
    expect(prismaMock.articleAuthor.upsert).not.toHaveBeenCalled();
  });

  it('adds a writer to an article', async () => {
    loginAs(admin);
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-2' } as any);

    await addArticleAuthor(articleId, 'user-2');

    expect(prismaMock.articleAuthor.upsert).toHaveBeenCalledWith({
      where: { articleId_userId: { articleId, userId: 'user-2' } },
      create: { articleId, userId: 'user-2', addedById: 'admin-1' },
      update: {},
    });
  });

  it('rejects unknown articles and users', async () => {
    loginAs(admin);
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(addArticleAuthor('no-such-article', 'user-2')).rejects.toThrow(
      'Artículo no encontrado',
    );
    await expect(addArticleAuthor(articleId, 'ghost')).rejects.toThrow('Usuario no encontrado');
    expect(prismaMock.articleAuthor.upsert).not.toHaveBeenCalled();
  });

  it('removes a writer', async () => {
    loginAs(admin);

    await removeArticleAuthor(articleId, 'user-2');

    expect(prismaMock.articleAuthor.deleteMany).toHaveBeenCalledWith({
      where: { articleId, userId: 'user-2' },
    });
  });
});
