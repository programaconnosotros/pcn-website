import prisma from '@/lib/prisma';
import { addArticleAuthor, removeArticleAuthor } from '@/actions/articles/article-authors';
import { articles } from '@/app/(platform)/lectura/articles';
import { actAs } from '@/test/db/fixtures';
import { expiredModel, quickUser } from '@/test/db/actions-fixtures';

// Escritores de los artículos de /lectura contra Postgres real.

const articleId = articles[0].id;

const writersOf = (userId: string) => prisma.articleAuthor.findMany({ where: { userId } });

describe('addArticleAuthor', () => {
  it('marks a user as writer once, crediting the admin, even if added twice', async () => {
    const admin = await quickUser({ role: 'ADMIN' });
    const writer = await quickUser();
    await actAs(admin.id);

    await expect(addArticleAuthor(articleId, writer.id)).resolves.toEqual({ success: true });
    await addArticleAuthor(articleId, writer.id);

    const rows = await writersOf(writer.id);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ articleId, addedById: admin.id });
    expect(expiredModel('ArticleAuthor')).toBe(true);
  });

  it('allows several writers on one article', async () => {
    const admin = await quickUser({ role: 'ADMIN' });
    const [a, b] = await Promise.all([quickUser(), quickUser()]);
    await actAs(admin.id);

    await addArticleAuthor(articleId, a.id);
    await addArticleAuthor(articleId, b.id);

    expect(
      await prisma.articleAuthor.count({ where: { articleId, userId: { in: [a.id, b.id] } } }),
    ).toBe(2);
  });

  it('rejects an unknown article or user without writing', async () => {
    const admin = await quickUser({ role: 'ADMIN' });
    const writer = await quickUser();
    await actAs(admin.id);

    await expect(addArticleAuthor('no-existe', writer.id)).rejects.toThrow(
      'Artículo no encontrado',
    );
    await expect(addArticleAuthor(articleId, 'no-existe')).rejects.toThrow('Usuario no encontrado');
    expect(await writersOf(writer.id)).toHaveLength(0);
  });

  it('forbids regular users and anonymous visitors', async () => {
    const user = await quickUser();
    await actAs(user.id);
    await expect(addArticleAuthor(articleId, user.id)).rejects.toThrow('No autorizado');
    await actAs();
    await expect(addArticleAuthor(articleId, user.id)).rejects.toThrow('No autorizado');
    expect(await writersOf(user.id)).toHaveLength(0);
  });
});

describe('removeArticleAuthor', () => {
  it('removes only that writer from that article', async () => {
    const admin = await quickUser({ role: 'ADMIN' });
    const [a, b] = await Promise.all([quickUser(), quickUser()]);
    await prisma.articleAuthor.createMany({
      data: [
        { articleId, userId: a.id },
        { articleId, userId: b.id },
        { articleId: articles[1].id, userId: a.id },
      ],
    });
    await actAs(admin.id);

    await expect(removeArticleAuthor(articleId, a.id)).resolves.toEqual({ success: true });

    expect((await writersOf(a.id)).map((row) => row.articleId)).toEqual([articles[1].id]);
    expect(await writersOf(b.id)).toHaveLength(1);
  });

  it('forbids regular users', async () => {
    const user = await quickUser();
    await prisma.articleAuthor.create({ data: { articleId, userId: user.id } });
    await actAs(user.id);

    await expect(removeArticleAuthor(articleId, user.id)).rejects.toThrow('No autorizado');
    expect(await writersOf(user.id)).toHaveLength(1);
  });
});
