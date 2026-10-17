import prisma from '@/lib/prisma';
import { actAs } from '@/test/db/fixtures';
import { expiredModel, quickUser } from '@/test/db/actions-fixtures';
import { getForumPost, listForumCategories, listForumPosts } from '@/lib/forum';
import { createForumPost, deleteForumPost, moderateForumPost } from './posts';
import { createForumComment, toggleForumPostLike } from './engagement';

// The forum against a real Postgres: the migration's categories, threads, replies and likes.

const content = 'Un tema con suficiente contenido para pasar la validación.';

it('starts with the categories the migration created, in order', async () => {
  const slugs = (await listForumCategories()).map(({ slug }) => slug);
  expect(slugs.slice(0, 6)).toEqual([
    'general',
    'ayuda',
    'carrera',
    'proyectos',
    'recursos',
    'off-topic',
  ]);
});

it('opens a thread, takes replies and likes, and bumps it to the top', async () => {
  const [author, replier] = [await quickUser(), await quickUser()];
  await actAs(author.id);
  const older = await createForumPost({
    title: 'Tema viejo',
    categoryId: 'forum-cat-general',
    content,
  });
  const thread = await createForumPost({
    title: 'Tema nuevo',
    categoryId: 'forum-cat-ayuda',
    content,
  });
  expect(expiredModel('ForumPost')).toBe(true);

  await actAs(replier.id);
  const reply = await createForumComment(older.id, {
    content: 'Primera respuesta',
    parentCommentId: null,
  });
  await createForumComment(older.id, { content: 'Respuesta anidada', parentCommentId: reply.id });
  await toggleForumPostLike(older.id);
  await expect(
    createForumComment(thread.id, { content: 'Cruzada', parentCommentId: reply.id }),
  ).rejects.toThrow(/no es de este tema/);

  const ids = (await listForumPosts(null)).map(({ id }) => id);
  expect(ids.indexOf(older.id)).toBeLessThan(ids.indexOf(thread.id));
  const detail = await getForumPost(older.id);
  expect(detail?.comments.map((c) => c.content)).toEqual([
    'Primera respuesta',
    'Respuesta anidada',
  ]);
  expect(detail?.likes).toEqual([{ userId: replier.id }]);
  expect((await listForumPosts('forum-cat-ayuda')).map(({ id }) => id)).toContain(thread.id);
});

it('locks threads for admins and deletes them with their replies', async () => {
  const [author, admin] = [await quickUser(), await quickUser({ role: 'ADMIN' })];
  await actAs(author.id);
  const { id } = await createForumPost({
    title: 'Para cerrar',
    categoryId: 'forum-cat-general',
    content,
  });
  await createForumComment(id, { content: 'Antes de cerrar', parentCommentId: null });

  await actAs(admin.id);
  await moderateForumPost(id, { isLocked: true, isPinned: true });
  await expect(createForumComment(id, { content: 'Tarde', parentCommentId: null })).rejects.toThrow(
    /está cerrado/,
  );

  await actAs(author.id);
  await deleteForumPost(id);
  expect(await prisma.forumComment.count({ where: { postId: id } })).toBe(0);
});
