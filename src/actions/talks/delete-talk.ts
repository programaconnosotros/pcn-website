'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { canManageEventById, canManageSomeEvent } from '@/lib/event-access';
import { findSession } from '@/lib/session';

export const deleteTalk = async (id: string) => {
  const sessionId = (await cookies()).get('sessionId')?.value;
  if (!sessionId) {
    throw new Error('Debes estar autenticado');
  }

  const session = await findSession(sessionId);

  // Admins y quienes gestionan eventos; el evento puntual se valida más abajo
  if (!session || !(await canManageSomeEvent(session.user))) {
    throw new Error('No tenés permisos para realizar esta acción');
  }

  const talk = await prisma.talk.findUnique({ where: { id } });
  if (!talk) {
    throw new Error('Charla no encontrada');
  }

  if (!(await canManageEventById(session.user, talk.eventId))) {
    throw new Error('No tenés permisos para realizar esta acción');
  }

  await prisma.talk.delete({ where: { id } });

  if (talk.eventId) {
    revalidatePath(`/eventos/${talk.eventId}/charlas`);
  }
  revalidatePath('/charlas');

  return { success: true };
};
