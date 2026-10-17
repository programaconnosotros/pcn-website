'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { findSession } from '@/lib/session';

export const deleteAdvice = async (id: string) => {
  const sessionId = (await cookies()).get('sessionId');

  if (!sessionId) throw new Error('User not authenticated');

  const session = await findSession(sessionId.value);

  if (!session) throw new Error('Session not found');

  // Verificar que el consejo existe
  const advice = await prisma.advice.findUnique({
    where: { id },
  });

  if (!advice) throw new Error('Consejo no encontrado');

  // Solo el autor puede eliminar (o admin)
  if (advice.authorId !== session.userId && session.user.role !== 'ADMIN') {
    throw new Error('No tienes permisos para eliminar este consejo');
  }

  await prisma.advice.delete({
    where: { id },
  });

  revalidatePath('/consejos');
  revalidatePath('/');
};
