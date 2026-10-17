import prisma from '@/lib/prisma';
import { actAs } from '@/test/db/fixtures';
import { quickUser } from '@/test/db/actions-fixtures';
import { countModerationQueues, listPendingReports } from '@/lib/content-reports';
import { createForumPost } from '@/actions/forum/posts';
import { createForumComment } from '@/actions/forum/engagement';
import { reportContent, reviewReports } from './content-reports';

// Reports against a real Postgres: who can file them, how they reach the admins and how the queue
// groups and closes them.

const content = 'Un tema con suficiente contenido para pasar la validación.';

const thread = async (authorId: string) => {
  await actAs(authorId);
  return createForumPost({ title: 'Tema reportable', categoryId: 'forum-cat-general', content });
};

it('files a report once per member, never on their own content, and tells the admins', async () => {
  const [author, reporter, admin] = [
    await quickUser(),
    await quickUser(),
    await quickUser({ role: 'ADMIN' }),
  ];
  const post = await thread(author.id);

  await expect(
    reportContent({ contentType: 'forum_post', contentId: post.id, reason: 'spam' }),
  ).resolves.toEqual({ success: false, error: 'No podés reportar algo tuyo.' });

  await actAs(reporter.id);
  await expect(
    reportContent({
      contentType: 'forum_post',
      contentId: post.id,
      reason: 'spam',
      details: '  Vende cursos  ',
    }),
  ).resolves.toEqual({ success: true });
  await expect(
    reportContent({ contentType: 'forum_post', contentId: post.id, reason: 'ofensivo' }),
  ).resolves.toMatchObject({ success: false, error: expect.stringMatching(/Ya lo reportaste/) });
  await expect(
    reportContent({ contentType: 'forum_post', contentId: 'no-existe', reason: 'spam' }),
  ).resolves.toEqual({ success: false, error: 'Eso ya no existe.' });
  await expect(
    reportContent({ contentType: 'nope', contentId: post.id, reason: 'spam' }),
  ).resolves.toMatchObject({ success: false });

  const report = await prisma.contentReport.findFirstOrThrow({ where: { contentId: post.id } });
  expect(report).toMatchObject({
    reporterId: reporter.id,
    reason: 'spam',
    details: 'Vende cursos',
  });
  const [notice] = await prisma.notification.findMany({
    where: { userId: admin.id, type: 'content_reported' },
  });
  expect(notice.message).toContain('Tema reportable');
  expect(JSON.parse(notice.metadata!)).toMatchObject({ href: '/admin/moderacion' });

  await actAs();
  await expect(
    reportContent({ contentType: 'forum_post', contentId: post.id, reason: 'spam' }),
  ).rejects.toThrow('Debes estar autenticado');
});

it('groups the queue by content, survives deleted content and closes reports for admins', async () => {
  const [author, first, second, admin] = [
    await quickUser(),
    await quickUser(),
    await quickUser(),
    await quickUser({ role: 'ADMIN' }),
  ];
  const post = await thread(author.id);
  await actAs(first.id);
  const reply = await createForumComment(post.id, { content: 'Algo feo', parentCommentId: null });

  await reportContent({ contentType: 'forum_post', contentId: post.id, reason: 'spam' });
  await actAs(second.id);
  await reportContent({ contentType: 'forum_post', contentId: post.id, reason: 'falso' });
  await reportContent({ contentType: 'forum_comment', contentId: reply.id, reason: 'acoso' });

  const groups = (await listPendingReports()).filter((g) =>
    [post.id, reply.id].includes(g.contentId),
  );
  expect(groups.map((g) => [g.contentType, g.reports.length])).toEqual([
    ['forum_post', 2],
    ['forum_comment', 1],
  ]);
  expect(groups[1].content?.href).toBe(`/foro/tema/${post.id}#comentario-${reply.id}`);
  expect((await countModerationQueues()).reports).toBeGreaterThanOrEqual(3);

  // The reply gets deleted: its report stays in the queue, without content.
  await prisma.forumComment.delete({ where: { id: reply.id } });
  const orphan = (await listPendingReports()).find((g) => g.contentId === reply.id);
  expect(orphan?.content).toBeNull();

  await expect(
    reviewReports({ contentType: 'forum_post', contentId: post.id, status: 'RESOLVED' }),
  ).rejects.toThrow('No autorizado');
  await actAs(admin.id);
  await expect(
    reviewReports({ contentType: 'forum_post', contentId: post.id, status: 'RESOLVED' }),
  ).resolves.toEqual({ success: true, count: 2 });
  await reviewReports({ contentType: 'forum_comment', contentId: reply.id, status: 'DISMISSED' });
  expect((await listPendingReports()).some((g) => [post.id, reply.id].includes(g.contentId))).toBe(
    false,
  );
  expect(
    await prisma.contentReport.findFirst({ where: { contentId: post.id, reporterId: first.id } }),
  ).toMatchObject({ status: 'RESOLVED', resolvedById: admin.id });

  // Once closed, the same member can report it again if it happens again.
  await actAs(first.id);
  await expect(
    reportContent({ contentType: 'forum_post', contentId: post.id, reason: 'spam' }),
  ).resolves.toEqual({ success: true });
});
