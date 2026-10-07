'use server';

import prisma from '@/lib/prisma';
import { adviceSchema } from '@/schemas/advice-schema';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { enforceRateLimit } from '@/lib/rate-limit';
import { findSession } from '@/lib/session';

export const editAdvice = async ({ id, content }: { id: string; content: string }) => {
  await enforceRateLimit('editContent');

  const validatedData = adviceSchema.parse({ content });

  const sessionId = (await cookies()).get('sessionId');

  if (!sessionId) throw new Error('User not authenticated');

  const session = await findSession(sessionId.value);

  if (!session) throw new Error('Session not found');

  // Verificar que el consejo existe
  const advice = await prisma.advice.findUnique({
    where: { id },
  });

  if (!advice) throw new Error('Consejo no encontrado');

  // Solo el autor puede editar (o admin)
  if (advice.authorId !== session.userId && session.user.role !== 'ADMIN') {
    throw new Error('No tienes permisos para editar este consejo');
  }

  await prisma.advice.update({
    where: { id },
    data: { content: validatedData.content },
  });

  revalidatePath('/consejos');
};
