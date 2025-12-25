'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const deleteEvent = async (id: string) => {
  const sessionId = cookies().get('sessionId')?.value;

  if (!sessionId) {
    throw new Error('Usuario no autenticado');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session) {
    throw new Error('Sesión no encontrada');
  }

  if (session.user.role !== 'ADMIN') {
    throw new Error('No tienes permisos para eliminar eventos');
  }

  // Verificar que el evento existe
  const existingEvent = await prisma.event.findUnique({
    where: { id },
  });

  if (!existingEvent) {
    throw new Error('Evento no encontrado');
  }

  // Eliminación lógica: establecer deletedAt
  await prisma.event.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  revalidatePath('/eventos');
  redirect('/eventos');
};


