import prisma from '@/lib/prisma';
import { setContentMark } from '@/actions/content-marks/set-content-mark';
import { getContentMarks } from '@/actions/content-marks/get-content-marks';
import type { ContentType } from '@/actions/content-marks/content-marks';
import { actAs } from '@/test/db/fixtures';
import { quickUser, uid } from '@/test/db/actions-fixtures';

// Marcas personales (leído, guardado, visto…) contra Postgres real.

const marksOf = (userId: string) =>
  prisma.contentMark.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } });

describe('setContentMark', () => {
  it('turns a mark on idempotently and off again', async () => {
    const user = await quickUser();
    await actAs(user.id);
    const articleId = `art-${uid()}`;

    await expect(setContentMark('article', articleId, 'read', true)).resolves.toEqual({
      success: true,
    });
    await setContentMark('article', articleId, 'read', true);
    await setContentMark('article', articleId, 'saved', true);

    expect(
      (await marksOf(user.id)).map(({ contentType, contentId, mark }) => [
        contentType,
        contentId,
        mark,
      ]),
    ).toEqual([
      ['article', articleId, 'read'],
      ['article', articleId, 'saved'],
    ]);

    await setContentMark('article', articleId, 'read', false);
    await setContentMark('article', articleId, 'read', false);
    expect((await marksOf(user.id)).map((row) => row.mark)).toEqual(['saved']);
  });

  it('only touches the session user’s marks', async () => {
    const user = await quickUser();
    const other = await quickUser();
    await prisma.contentMark.create({
      data: { userId: other.id, contentType: 'video', contentId: 'abc', mark: 'watched' },
    });
    await actAs(user.id);

    await setContentMark('video', 'abc', 'watched', true);
    await setContentMark('video', 'abc', 'watched', false);

    expect(await marksOf(other.id)).toHaveLength(1);
    expect(await marksOf(user.id)).toHaveLength(0);
  });

  it('does not duplicate a mark when the same request arrives in parallel', async () => {
    const user = await quickUser();
    await actAs(user.id);

    await Promise.allSettled(
      Array.from({ length: 5 }, () =>
        setContentMark('leetcode-problem', 'two-sum', 'solved', true),
      ),
    );

    expect(await marksOf(user.id)).toHaveLength(1);
  });

  it.each([
    ['an unknown content type', 'podcast', 'x', 'read'],
    ['a mark that does not apply to the type', 'video', 'x', 'read'],
    ['an Object prototype key as type', 'constructor', 'x', 'read'],
    ['an empty content id', 'article', '', 'read'],
    ['a content id over 100 characters', 'article', 'x'.repeat(101), 'read'],
  ])('rejects %s without writing', async (_case, type, contentId, mark) => {
    const user = await quickUser();
    await actAs(user.id);

    await expect(setContentMark(type as ContentType, contentId, mark, true)).rejects.toThrow();
    expect(await marksOf(user.id)).toHaveLength(0);
  });

  it('rejects anonymous visitors', async () => {
    await actAs();
    await expect(setContentMark('article', '1', 'read', true)).rejects.toThrow(
      'Debes estar autenticado',
    );
  });
});

describe('getContentMarks', () => {
  it('returns the session user’s marks for one content type, newest first', async () => {
    const user = await quickUser();
    const other = await quickUser();
    await prisma.contentMark.createMany({
      data: [
        {
          userId: user.id,
          contentType: 'article',
          contentId: '1',
          mark: 'read',
          createdAt: new Date('2024-01-01'),
        },
        {
          userId: user.id,
          contentType: 'article',
          contentId: '2',
          mark: 'saved',
          createdAt: new Date('2024-02-01'),
        },
        { userId: user.id, contentType: 'video', contentId: 'v', mark: 'watched' },
        { userId: other.id, contentType: 'article', contentId: '3', mark: 'read' },
      ],
    });
    await actAs(user.id);

    await expect(getContentMarks('article')).resolves.toEqual({
      isAuthenticated: true,
      marks: [
        { contentId: '2', mark: 'saved' },
        { contentId: '1', mark: 'read' },
      ],
    });
  });

  it('returns nothing to anonymous visitors and rejects unknown types', async () => {
    await actAs();
    await expect(getContentMarks('article')).resolves.toEqual({
      isAuthenticated: false,
      marks: [],
    });
    await expect(getContentMarks('podcast' as ContentType)).rejects.toThrow(
      'Tipo de contenido inválido',
    );
  });

  it('is removed in cascade when the user is deleted', async () => {
    const user = await quickUser();
    await prisma.contentMark.create({
      data: { userId: user.id, contentType: 'article', contentId: '1', mark: 'read' },
    });

    await prisma.user.delete({ where: { id: user.id } });

    expect(await prisma.contentMark.count({ where: { userId: user.id } })).toBe(0);
  });
});
