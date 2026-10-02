'use server';

import prisma from '@/lib/prisma';
import { adviseSchema } from '@/schemas/advise-schema';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { enforceRateLimit } from '@/lib/rate-limit';
import { findSession } from '@/lib/session';

export const editAdvise = async ({ id, content }: { id: string; content: string }) => {
  await enforceRateLimit('editContent');

  const validatedData = adviseSchema.parse({ content });

  const sessionId = (await cookies()).get('sessionId');

  if (!sessionId) throw new Error('User not authenticated');

  const session = await findSession(sessionId.value);

  if (!session) throw new Error('Session not found');

  // Verificar que el consejo existe
  const advise = await prisma.advise.findUnique({
    where: { id },
  });

  if (!advise) throw new Error('Consejo no encontrado');

  // Solo el autor puede editar (o admin)
  if (advise.authorId !== session.userId && session.user.role !== 'ADMIN') {
    throw new Error('No tienes permisos para editar este consejo');
  }

  await prisma.advise.update({
    where: { id },
    data: { content: validatedData.content },
  });

  revalidatePath('/consejos');
};
