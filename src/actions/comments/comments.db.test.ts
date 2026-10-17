import prisma from '@/lib/prisma';
import { createComment } from '@/actions/comments/create-comment';
import { actAs } from '@/test/db/fixtures';
import { expiredModel, makeAdvice, quickUser } from '@/test/db/actions-fixtures';
import { toggleLike } from '@/actions/advice/like-advice';
import { extractedConsejos } from '@/data/consejos-extraidos';
import { getConsejoDetail, listExtractedActivity } from '@/lib/consejos-server';
import { visibleExtractedConsejos } from '@/lib/hidden-consejos';
import {
  hideExtractedConsejo,
  restoreExtractedConsejo,
} from '@/actions/advice/hide-extracted-consejo';

// Comentarios y respuestas de los consejos contra Postgres real.

describe('createComment', () => {
  it('stores a top-level comment for the session user and returns it with its public author', async () => {
    const author = await quickUser();
    const commenter = await quickUser();
    const advice = await makeAdvice(author.id);
    await actAs(commenter.id);

    const comment = await createComment({
      content: 'Muy buen consejo',
      adviceId: advice.id,
      parentCommentId: null,
    });

    expect(comment.author).toEqual({ id: commenter.id, name: commenter.name, image: null });
    const stored = await prisma.comment.findUniqueOrThrow({ where: { id: comment.id } });
    expect(stored).toMatchObject({
      content: 'Muy buen consejo',
      authorId: commenter.id,
      adviceId: advice.id,
      parentCommentId: null,
    });
    expect(expiredModel('Comment')).toBe(true);
  });

  it('stores a reply linked to its parent comment', async () => {
    const author = await quickUser();
    const advice = await makeAdvice(author.id);
    const parent = await prisma.comment.create({
      data: { content: 'Pregunta', authorId: author.id, adviceId: advice.id },
    });
    const replier = await quickUser();
    await actAs(replier.id);

    const reply = await createComment({
      content: 'Respuesta',
      adviceId: advice.id,
      parentCommentId: parent.id,
    });

    const replies = await prisma.comment.findMany({ where: { parentCommentId: parent.id } });
    expect(replies.map((row) => row.id)).toEqual([reply.id]);
    expect(await prisma.comment.count({ where: { adviceId: advice.id } })).toBe(2);
  });

  it('removes the replies in cascade when the parent comment is deleted', async () => {
    const author = await quickUser();
    const advice = await makeAdvice(author.id);
    await actAs(author.id);
    const parent = await createComment({
      content: 'Padre',
      adviceId: advice.id,
      parentCommentId: null,
    });
    await createComment({ content: 'Hija', adviceId: advice.id, parentCommentId: parent.id });

    await prisma.comment.delete({ where: { id: parent.id } });

    expect(await prisma.comment.count({ where: { adviceId: advice.id } })).toBe(0);
  });

  it('rejects anonymous visitors without writing anything', async () => {
    const author = await quickUser();
    const advice = await makeAdvice(author.id);
    await actAs();

    await expect(
      createComment({ content: 'Anónimo', adviceId: advice.id, parentCommentId: null }),
    ).rejects.toThrow('No autenticado');
    expect(await prisma.comment.count({ where: { adviceId: advice.id } })).toBe(0);
  });

  it.each([
    ['empty', ''],
    ['longer than 500 characters', 'x'.repeat(501)],
  ])('rejects a comment that is %s', async (_case, content) => {
    const author = await quickUser();
    const advice = await makeAdvice(author.id);
    await actAs(author.id);

    await expect(
      createComment({ content, adviceId: advice.id, parentCommentId: null }),
    ).rejects.toThrow();
    expect(await prisma.comment.count({ where: { adviceId: advice.id } })).toBe(0);
  });

  it('fails on an advice that does not exist (foreign key)', async () => {
    const user = await quickUser();
    await actAs(user.id);

    await expect(
      createComment({ content: 'Hola', adviceId: 'no-existe', parentCommentId: null }),
    ).rejects.toThrow();
    expect(await prisma.comment.count({ where: { authorId: user.id } })).toBe(0);
  });

  it('fails when replying to a comment that does not exist', async () => {
    const user = await quickUser();
    const advice = await makeAdvice(user.id);
    await actAs(user.id);

    await expect(
      createComment({ content: 'Hola', adviceId: advice.id, parentCommentId: 'no-existe' }),
    ).rejects.toThrow();
    expect(await prisma.comment.count({ where: { adviceId: advice.id } })).toBe(0);
  });

  it('rejects a reply whose parent comment belongs to another advice', async () => {
    const author = await quickUser();
    const adviceA = await makeAdvice(author.id);
    const adviceB = await makeAdvice(author.id);
    const parentOnA = await prisma.comment.create({
      data: { content: 'En A', authorId: author.id, adviceId: adviceA.id },
    });
    await actAs(author.id);

    await expect(
      createComment({ content: 'Respuesta', adviceId: adviceB.id, parentCommentId: parentOnA.id }),
    ).rejects.toThrow();
    expect(await prisma.comment.count({ where: { adviceId: adviceB.id } })).toBe(0);
  });
});

describe('consejos extracted from the conversations', () => {
  const [extracted] = extractedConsejos;

  it('take comments, replies and likes by their auto- id', async () => {
    const user = await quickUser();
    await actAs(user.id);

    const comment = await createComment({
      content: 'Me sirvió',
      adviceId: extracted.id,
      parentCommentId: null,
    });
    const reply = await createComment({
      content: 'A mí también',
      adviceId: extracted.id,
      parentCommentId: comment.id,
    });
    await toggleLike(extracted.id);

    expect(
      await prisma.comment.findMany({
        where: { id: { in: [comment.id, reply.id] } },
        select: { adviceId: true, extractedId: true },
      }),
    ).toEqual([
      { adviceId: null, extractedId: extracted.id },
      { adviceId: null, extractedId: extracted.id },
    ]);
    const activity = await listExtractedActivity();
    expect(activity[extracted.id].likes).toContainEqual({ userId: user.id });

    await toggleLike(extracted.id);
    expect(await prisma.like.count({ where: { userId: user.id, extractedId: extracted.id } })).toBe(
      0,
    );
  });

  it('point every like and comment at exactly one consejo', async () => {
    const user = await quickUser();
    const advice = await makeAdvice(user.id);
    await expect(
      prisma.like.create({
        data: { userId: user.id, adviceId: advice.id, extractedId: extracted.id },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.comment.create({ data: { content: 'Huérfano', authorId: user.id } }),
    ).rejects.toThrow();
  });
});

describe('hidden extracted consejos', () => {
  it('leave the list, the detail and the search, and come back when restored', async () => {
    const [extracted] = extractedConsejos;
    const admin = await quickUser({ role: 'ADMIN' });
    await actAs(admin.id);

    await hideExtractedConsejo(extracted.id);
    expect((await visibleExtractedConsejos()).map(({ id }) => id)).not.toContain(extracted.id);
    expect(await getConsejoDetail(extracted.id)).toBeNull();

    await restoreExtractedConsejo(extracted.id);
    expect((await visibleExtractedConsejos()).map(({ id }) => id)).toContain(extracted.id);
    expect(await getConsejoDetail(extracted.id)).not.toBeNull();
  });
});
