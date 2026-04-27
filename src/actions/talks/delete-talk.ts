'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export const deleteTalk = async (id: string) => {
  const sessionId = (await cookies()).get('sessionId')?.value;
  if (!sessionId) {
    throw new Error('Debes estar autenticado');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('No tenés permisos para realizar esta acción');
  }

  const talk = await prisma.talk.findUnique({ where: { id } });
  if (!talk) {
    throw new Error('Charla no encontrada');
  }

  await prisma.talk.delete({ where: { id } });

  if (talk.eventId) {
    revalidatePath(`/eventos/${talk.eventId}/charlas`);
  }

  return { success: true };
};
