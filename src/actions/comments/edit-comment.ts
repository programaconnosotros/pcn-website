'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { enforceRateLimit } from '@/lib/rate-limit';
import { findSession } from '@/lib/session';

const editCommentSchema = z.object({
  commentId: z.string().min(1),
  content: z
    .string()
    .trim()
    .min(1, { message: 'El comentario no puede estar vacío' })
    .max(500, { message: 'El comentario no puede tener más de 500 caracteres' }),
});

/** Changes the text of a comment on a consejo. Only its author can. */
export const editComment = async (input: z.infer<typeof editCommentSchema>) => {
  await enforceRateLimit('comment');

  const { commentId, content } = editCommentSchema.parse(input);

  const sessionId = (await cookies()).get('sessionId');

  if (!sessionId) throw new Error('No autenticado');

  const session = await findSession(sessionId.value);

  if (!session) throw new Error('Sesión no encontrada');

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, adviceId: true, extractedId: true },
  });

  if (!comment) throw new Error('Comentario no encontrado');

  if (comment.authorId !== session.userId) {
    throw new Error('Solo quien escribió el comentario puede editarlo');
  }

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { content },
  });

  revalidatePath(`/consejos/${comment.adviceId ?? comment.extractedId}`);

  return updated;
};
