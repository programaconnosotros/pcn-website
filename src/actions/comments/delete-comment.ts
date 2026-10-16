'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { findSession } from '@/lib/session';

/** Deletes a comment on a consejo, with its replies. Only its author or an admin can. */
export const deleteComment = async (commentId: string) => {
  const id = z.string().min(1).parse(commentId);

  const sessionId = (await cookies()).get('sessionId');

  if (!sessionId) throw new Error('No autenticado');

  const session = await findSession(sessionId.value);

  if (!session) throw new Error('Sesión no encontrada');

  const comment = await prisma.comment.findUnique({
    where: { id },
    select: { authorId: true, adviceId: true, extractedId: true },
  });

  if (!comment) throw new Error('Comentario no encontrado');

  if (comment.authorId !== session.userId && session.user.role !== 'ADMIN') {
    throw new Error('No tenés permisos para eliminar este comentario');
  }

  // Las respuestas se borran en cascada con el comentario.
  await prisma.comment.delete({ where: { id } });

  revalidatePath(`/consejos/${comment.adviceId ?? comment.extractedId}`);
};
