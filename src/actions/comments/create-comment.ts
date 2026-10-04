'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { enforceRateLimit } from '@/lib/rate-limit';
import { findSession } from '@/lib/session';

const commentSchema = z.object({
  content: z
    .string()
    .min(1, { message: 'El comentario no puede estar vacío' })
    .max(500, { message: 'El comentario no puede tener más de 500 caracteres' }),
  adviseId: z.string(),
  parentCommentId: z.string().nullable(),
});

export const createComment = async ({
  content,
  adviseId,
  parentCommentId,
}: z.infer<typeof commentSchema>) => {
  await enforceRateLimit('comment');

  const validatedData = commentSchema.parse({ content, adviseId, parentCommentId });

  const sessionId = (await cookies()).get('sessionId');

  if (!sessionId) throw new Error('No autenticado');

  const session = await findSession(sessionId.value);

  if (!session) throw new Error('Sesión no encontrada');

  // Una respuesta va en el mismo consejo que su comentario padre: si no, quedaría colgada de un
  // hilo de otro consejo y no aparecería en ninguno.
  if (validatedData.parentCommentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: validatedData.parentCommentId },
      select: { adviseId: true },
    });
    if (!parent || parent.adviseId !== validatedData.adviseId) {
      throw new Error('El comentario al que respondés no es de este consejo');
    }
  }

  const comment = await prisma.comment.create({
    data: {
      content: validatedData.content,
      authorId: session.userId,
      adviseId: validatedData.adviseId,
      parentCommentId: validatedData.parentCommentId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  revalidatePath(`/consejos/${adviseId}`);

  return comment;
};
