'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { excerpt } from '@/actions/notifications/excerpt';
import { notifyUsers } from '@/actions/notifications/notify-users';
import prisma from '@/lib/prisma';
import { enforceRateLimit } from '@/lib/rate-limit';
import { forumCommentSchema, type ForumCommentFormData } from '@/schemas/forum-schema';

const idSchema = z.string().min(1).max(64);

async function requireUser() {
  const session = await getCurrentSession();
  if (!session) throw new Error('Debes estar autenticado');
  return session.user;
}

export async function toggleForumPostLike(postId: string) {
  const user = await requireUser();
  const id = idSchema.parse(postId);
  const existing = await prisma.forumPostLike.findUnique({
    where: { userId_postId: { userId: user.id, postId: id } },
    select: { id: true },
  });
  if (existing) {
    await prisma.forumPostLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.forumPostLike.create({ data: { userId: user.id, postId: id } });
    const post = await prisma.forumPost.findUnique({
      where: { id },
      select: { authorId: true, title: true },
    });
    await notifyUsers(
      [post?.authorId],
      {
        type: 'forum_post_liked',
        title: 'Le gustó tu tema',
        message: `A ${user.name} le gustó tu tema "${excerpt(post?.title ?? '')}".`,
        href: `/foro/tema/${id}`,
        metadata: { postId: id, userId: user.id },
      },
      user.id,
    );
  }
  revalidatePath(`/foro/tema/${id}`);
  return { liked: !existing };
}

/** Like or unlike a reply in a thread. Any member, once per reply. */
export async function toggleForumCommentLike(commentId: string) {
  const user = await requireUser();
  const id = idSchema.parse(commentId);
  const comment = await prisma.forumComment.findUnique({
    where: { id },
    select: { authorId: true, content: true, postId: true },
  });
  if (!comment) throw new Error('El comentario no existe');

  const where = { userId_commentId: { userId: user.id, commentId: id } };
  const existing = await prisma.forumCommentLike.findUnique({ where, select: { id: true } });
  if (existing) {
    await prisma.forumCommentLike.delete({ where });
  } else {
    await prisma.forumCommentLike.create({ data: { userId: user.id, commentId: id } });
    await notifyUsers(
      [comment.authorId],
      {
        type: 'forum_comment_liked',
        title: 'Le gustó tu respuesta',
        message: `A ${user.name} le gustó tu respuesta "${excerpt(comment.content)}".`,
        href: `/foro/tema/${comment.postId}#comentario-${id}`,
        metadata: { postId: comment.postId, commentId: id, userId: user.id },
      },
      user.id,
    );
  }
  revalidatePath(`/foro/tema/${comment.postId}`);
  return { liked: !existing };
}

export async function createForumComment(postId: string, input: ForumCommentFormData) {
  const user = await requireUser();
  await enforceRateLimit('comment');
  const id = idSchema.parse(postId);
  const parsed = forumCommentSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Datos inválidos');
  const { content, parentCommentId } = parsed.data;

  const post = await prisma.forumPost.findUnique({
    where: { id },
    select: { isLocked: true, authorId: true, title: true },
  });
  if (!post) throw new Error('El tema no existe');
  if (post.isLocked) throw new Error('El tema está cerrado: no admite respuestas nuevas');
  // A reply goes in the same thread as the comment it answers.
  let parent: { postId: string; authorId: string; content: string } | null = null;
  if (parentCommentId) {
    parent = await prisma.forumComment.findUnique({
      where: { id: parentCommentId },
      select: { postId: true, authorId: true, content: true },
    });
    if (parent?.postId !== id) throw new Error('El comentario al que respondés no es de este tema');
  }

  const [comment] = await prisma.$transaction([
    prisma.forumComment.create({
      data: { content, parentCommentId, postId: id, authorId: user.id },
      select: { id: true },
    }),
    prisma.forumPost.update({ where: { id }, data: { activeAt: new Date() } }),
  ]);

  // Whoever wrote the comment being answered hears about it as a reply to them; the thread's
  // author hears about every other reply (once, even when they wrote that comment too).
  const href = `/foro/tema/${id}#comentario-${comment.id}`;
  const metadata = { postId: id, commentId: comment.id, userId: user.id };
  if (parent) {
    await notifyUsers(
      [parent.authorId],
      {
        type: 'forum_comment_replied',
        push: true,
        title: 'Respondieron tu comentario',
        message: `${user.name} respondió tu comentario "${excerpt(parent.content)}": "${excerpt(content)}".`,
        href,
        metadata,
      },
      user.id,
    );
  }
  if (post.authorId !== parent?.authorId) {
    await notifyUsers(
      [post.authorId],
      {
        type: 'forum_post_replied',
        push: true,
        title: 'Respondieron tu tema',
        message: `${user.name} respondió en "${excerpt(post.title)}": "${excerpt(content)}".`,
        href,
        metadata,
      },
      user.id,
    );
  }

  revalidatePath('/foro', 'layout');
  return comment;
}

export async function deleteForumComment(commentId: string) {
  const user = await requireUser();
  const comment = await prisma.forumComment.findUnique({
    where: { id: idSchema.parse(commentId) },
    select: { id: true, authorId: true, postId: true },
  });
  if (!comment) throw new Error('El comentario no existe');
  if (comment.authorId !== user.id && user.role !== 'ADMIN') {
    throw new Error('Solo quien escribió el comentario puede borrarlo');
  }
  await prisma.forumComment.delete({ where: { id: comment.id } });
  revalidatePath(`/foro/tema/${comment.postId}`);
}
