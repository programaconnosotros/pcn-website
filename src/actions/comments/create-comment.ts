'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';

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
  const validatedData = commentSchema.parse({ content, adviseId, parentCommentId });

  const sessionId = cookies().get('sessionId');

  if (!sessionId) throw new Error('No autenticado');

  const session = await prisma.session.findUnique({
    where: { id: sessionId.value },
  });

  if (!session) throw new Error('Sesión no encontrada');

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
          email: true,
          image: true,
        },
      },
    },
  });

  revalidatePath(`/consejos/${adviseId}`);

  return comment;
};
