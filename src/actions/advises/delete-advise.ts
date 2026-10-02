'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { findSession } from '@/lib/session';

export const deleteAdvise = async (id: string) => {
  const sessionId = (await cookies()).get('sessionId');

  if (!sessionId) throw new Error('User not authenticated');

  const session = await findSession(sessionId.value);

  if (!session) throw new Error('Session not found');

  // Verificar que el consejo existe
  const advise = await prisma.advise.findUnique({
    where: { id },
  });

  if (!advise) throw new Error('Consejo no encontrado');

  // Solo el autor puede eliminar (o admin)
  if (advise.authorId !== session.userId && session.user.role !== 'ADMIN') {
    throw new Error('No tienes permisos para eliminar este consejo');
  }

  await prisma.advise.delete({
    where: { id },
  });

  revalidatePath('/consejos');
  revalidatePath('/');
};
