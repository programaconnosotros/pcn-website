'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { canCreateEvents, canDeleteEvent } from '@/lib/event-permissions';

export const deleteEvent = async (id: string) => {
  const sessionId = (await cookies()).get('sessionId')?.value;

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

  // Solo admins y ambassadors eliminan eventos
  if (!canCreateEvents(session.user)) {
    throw new Error('No tienes permisos para eliminar eventos');
  }

  // Verificar que el evento existe
  const existingEvent = await prisma.event.findUnique({
    where: { id },
    include: { admins: { select: { userId: true } } },
  });

  if (!existingEvent) {
    throw new Error('Evento no encontrado');
  }

  // Los ambassadors solo eliminan los eventos que crearon
  if (!canDeleteEvent(session.user, existingEvent)) {
    throw new Error('Solo puedes eliminar los eventos que creaste');
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
