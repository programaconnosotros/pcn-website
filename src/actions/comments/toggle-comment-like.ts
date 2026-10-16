'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { findSession } from '@/lib/session';
import { notifyUsers } from '@/actions/notifications/notify-users';
import { excerpt } from '@/actions/notifications/excerpt';

/** Like or unlike a comment (or reply) on a consejo. Any member, once per comment. */
export const toggleCommentLike = async (commentId: string) => {
  const id = z.string().min(1).max(40).parse(commentId);

  const sessionId = (await cookies()).get('sessionId');
  if (!sessionId) throw new Error('No autenticado');

  const session = await findSession(sessionId.value);
  if (!session) throw new Error('Sesión no encontrada');

  const comment = await prisma.comment.findUnique({
    where: { id },
    select: { authorId: true, content: true, adviceId: true, extractedId: true },
  });
  if (!comment) throw new Error('Comentario no encontrado');

  const where = { userId_commentId: { userId: session.userId, commentId: id } };
  const existing = await prisma.commentLike.findUnique({ where, select: { id: true } });

  if (existing) {
    await prisma.commentLike.delete({ where });
  } else {
    await prisma.commentLike.create({ data: { userId: session.userId, commentId: id } });
    await notifyUsers(
      [comment.authorId],
      {
        type: 'comment_liked',
        title: 'Le gustó tu comentario',
        message: `A ${session.user.name} le gustó tu comentario "${excerpt(comment.content)}".`,
        href: `/consejos/${comment.adviceId ?? comment.extractedId}`,
        metadata: { commentId: id, userId: session.userId },
      },
      session.userId,
    );
  }

  revalidatePath(`/consejos/${comment.adviceId ?? comment.extractedId}`);

  return { liked: !existing };
};
