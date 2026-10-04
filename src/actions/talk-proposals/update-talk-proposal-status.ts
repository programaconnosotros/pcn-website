'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { canManageEventById, canManageSomeEvent } from '@/lib/event-access';
import { TalkProposalStatus } from '@/generated/prisma/client';
import { findSession } from '@/lib/session';

export const updateTalkProposalStatus = async (id: string, status: TalkProposalStatus) => {
  const sessionId = (await cookies()).get('sessionId')?.value;
  if (!sessionId) {
    throw new Error('Debes estar autenticado');
  }

  const session = await findSession(sessionId);

  // Admins y quienes gestionan eventos; el evento puntual se valida más abajo
  if (!session || !(await canManageSomeEvent(session.user))) {
    throw new Error('No tenés permisos para realizar esta acción');
  }

  const existing = await prisma.talkProposal.findUnique({
    where: { id },
    select: { eventId: true },
  });
  if (!existing) {
    throw new Error('Propuesta no encontrada');
  }

  if (!(await canManageEventById(session.user, existing.eventId))) {
    throw new Error('No tenés permisos para realizar esta acción');
  }

  const proposal = await prisma.talkProposal.update({
    where: { id },
    data: { status },
  });

  revalidatePath(`/eventos/${proposal.eventId}/propuestas-de-charlas`);

  return { success: true };
};
