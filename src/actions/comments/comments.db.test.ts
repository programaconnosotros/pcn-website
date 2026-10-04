import prisma from '@/lib/prisma';
import { createComment } from '@/actions/comments/create-comment';
import { actAs } from '@/test/db/fixtures';
import { expiredModel, makeAdvise, quickUser } from '@/test/db/actions-fixtures';

// Comentarios y respuestas de los consejos contra Postgres real.

describe('createComment', () => {
  it('stores a top-level comment for the session user and returns it with its public author', async () => {
    const author = await quickUser();
    const commenter = await quickUser();
    const advise = await makeAdvise(author.id);
    await actAs(commenter.id);

    const comment = await createComment({
      content: 'Muy buen consejo',
      adviseId: advise.id,
      parentCommentId: null,
    });

    expect(comment.author).toEqual({ id: commenter.id, name: commenter.name, image: null });
    const stored = await prisma.comment.findUniqueOrThrow({ where: { id: comment.id } });
    expect(stored).toMatchObject({
      content: 'Muy buen consejo',
      authorId: commenter.id,
      adviseId: advise.id,
      parentCommentId: null,
    });
    expect(expiredModel('Comment')).toBe(true);
  });

  it('stores a reply linked to its parent comment', async () => {
    const author = await quickUser();
    const advise = await makeAdvise(author.id);
    const parent = await prisma.comment.create({
      data: { content: 'Pregunta', authorId: author.id, adviseId: advise.id },
    });
    const replier = await quickUser();
    await actAs(replier.id);

    const reply = await createComment({
      content: 'Respuesta',
      adviseId: advise.id,
      parentCommentId: parent.id,
    });

    const replies = await prisma.comment.findMany({ where: { parentCommentId: parent.id } });
    expect(replies.map((row) => row.id)).toEqual([reply.id]);
    expect(await prisma.comment.count({ where: { adviseId: advise.id } })).toBe(2);
  });

  it('removes the replies in cascade when the parent comment is deleted', async () => {
    const author = await quickUser();
    const advise = await makeAdvise(author.id);
    await actAs(author.id);
    const parent = await createComment({
      content: 'Padre',
      adviseId: advise.id,
      parentCommentId: null,
    });
    await createComment({ content: 'Hija', adviseId: advise.id, parentCommentId: parent.id });

    await prisma.comment.delete({ where: { id: parent.id } });

    expect(await prisma.comment.count({ where: { adviseId: advise.id } })).toBe(0);
  });

  it('rejects anonymous visitors without writing anything', async () => {
    const author = await quickUser();
    const advise = await makeAdvise(author.id);
    await actAs();

    await expect(
      createComment({ content: 'Anónimo', adviseId: advise.id, parentCommentId: null }),
    ).rejects.toThrow('No autenticado');
    expect(await prisma.comment.count({ where: { adviseId: advise.id } })).toBe(0);
  });

  it.each([
    ['empty', ''],
    ['longer than 500 characters', 'x'.repeat(501)],
  ])('rejects a comment that is %s', async (_case, content) => {
    const author = await quickUser();
    const advise = await makeAdvise(author.id);
    await actAs(author.id);

    await expect(
      createComment({ content, adviseId: advise.id, parentCommentId: null }),
    ).rejects.toThrow();
    expect(await prisma.comment.count({ where: { adviseId: advise.id } })).toBe(0);
  });

  it('fails on an advise that does not exist (foreign key)', async () => {
    const user = await quickUser();
    await actAs(user.id);

    await expect(
      createComment({ content: 'Hola', adviseId: 'no-existe', parentCommentId: null }),
    ).rejects.toThrow();
    expect(await prisma.comment.count({ where: { authorId: user.id } })).toBe(0);
  });

  it('fails when replying to a comment that does not exist', async () => {
    const user = await quickUser();
    const advise = await makeAdvise(user.id);
    await actAs(user.id);

    await expect(
      createComment({ content: 'Hola', adviseId: advise.id, parentCommentId: 'no-existe' }),
    ).rejects.toThrow();
    expect(await prisma.comment.count({ where: { adviseId: advise.id } })).toBe(0);
  });

  it('rejects a reply whose parent comment belongs to another advise', async () => {
    const author = await quickUser();
    const adviseA = await makeAdvise(author.id);
    const adviseB = await makeAdvise(author.id);
    const parentOnA = await prisma.comment.create({
      data: { content: 'En A', authorId: author.id, adviseId: adviseA.id },
    });
    await actAs(author.id);

    await expect(
      createComment({ content: 'Respuesta', adviseId: adviseB.id, parentCommentId: parentOnA.id }),
    ).rejects.toThrow();
    expect(await prisma.comment.count({ where: { adviseId: adviseB.id } })).toBe(0);
  });
});
