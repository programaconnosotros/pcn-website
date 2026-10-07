'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentSession } from '@/actions/auth/get-current-session';
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
  if (existing) await prisma.forumPostLike.delete({ where: { id: existing.id } });
  else await prisma.forumPostLike.create({ data: { userId: user.id, postId: id } });
  revalidatePath(`/foro/tema/${id}`);
  return { liked: !existing };
}

export async function createForumComment(postId: string, input: ForumCommentFormData) {
  const user = await requireUser();
  await enforceRateLimit('comment');
  const id = idSchema.parse(postId);
  const parsed = forumCommentSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Datos inválidos');
  const { content, parentCommentId } = parsed.data;

  const post = await prisma.forumPost.findUnique({ where: { id }, select: { isLocked: true } });
  if (!post) throw new Error('El tema no existe');
  if (post.isLocked) throw new Error('El tema está cerrado: no admite respuestas nuevas');
  // A reply goes in the same thread as the comment it answers.
  if (parentCommentId) {
    const parent = await prisma.forumComment.findUnique({
      where: { id: parentCommentId },
      select: { postId: true },
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
