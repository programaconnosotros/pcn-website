'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { canManageEventById, canManageSomeEvent } from '@/lib/event-access';

export const deleteTalkProposal = async (id: string) => {
  const sessionId = (await cookies()).get('sessionId')?.value;
  if (!sessionId) {
    throw new Error('Debes estar autenticado');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  // Admins y quienes gestionan eventos; el evento puntual se valida más abajo
  if (!session || !(await canManageSomeEvent(session.user))) {
    throw new Error('No tenés permisos para realizar esta acción');
  }

  const proposal = await prisma.talkProposal.findUnique({ where: { id } });
  if (!proposal) {
    throw new Error('Propuesta no encontrada');
  }

  if (!(await canManageEventById(session.user, proposal.eventId))) {
    throw new Error('No tenés permisos para realizar esta acción');
  }

  await prisma.talkProposal.delete({ where: { id } });

  revalidatePath(`/eventos/${proposal.eventId}/propuestas-de-charlas`);

  return { success: true };
};
