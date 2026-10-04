'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { canManageEventById, canManageSomeEvent } from '@/lib/event-access';
import { findSession } from '@/lib/session';

export const createTalkFromProposal = async (proposalId: string) => {
  const sessionId = (await cookies()).get('sessionId')?.value;
  if (!sessionId) {
    throw new Error('Debes estar autenticado');
  }

  const session = await findSession(sessionId);

  // Admins y quienes gestionan eventos; el evento puntual se valida más abajo
  if (!session || !(await canManageSomeEvent(session.user))) {
    throw new Error('No tenés permisos para realizar esta acción');
  }

  const proposal = await prisma.talkProposal.findUnique({
    where: { id: proposalId },
    // Los teléfonos pasan de la propuesta a la charla; el cliente los omite por defecto
    include: {
      talk: true,
      speakers: { orderBy: { order: 'asc' }, omit: { speakerPhone: false } },
    },
  });

  if (!proposal) {
    throw new Error('Propuesta no encontrada');
  }

  if (!(await canManageEventById(session.user, proposal.eventId))) {
    throw new Error('No tenés permisos para realizar esta acción');
  }

  if (proposal.talk) {
    return { success: true, talkId: proposal.talk.id, alreadyExists: true };
  }

  // Un doble click convierte la misma propuesta dos veces a la vez: la segunda choca con la
  // restricción única de proposalId y responde con la charla que creó la primera.
  const talk = await prisma.talk
    .create({
      data: {
        eventId: proposal.eventId,
        proposalId: proposal.id,
        title: proposal.title,
        description: proposal.description,
        speakers: {
          create: proposal.speakers.map((s, idx) => ({
            userId: s.userId ?? null,
            speakerName: s.speakerName,
            speakerPhone: s.speakerPhone,
            isProfessional: s.isProfessional,
            jobTitle: s.jobTitle,
            enterprise: s.enterprise,
            isStudent: s.isStudent,
            career: s.career,
            studyPlace: s.studyPlace,
            order: idx,
          })),
        },
      },
    })
    .catch(async (error: unknown) => {
      if ((error as { code?: string }).code !== 'P2002') throw error;
      return null;
    });

  if (!talk) {
    const existing = await prisma.talk.findUniqueOrThrow({ where: { proposalId: proposal.id } });
    return { success: true, talkId: existing.id, alreadyExists: true };
  }

  revalidatePath(`/eventos/${proposal.eventId}/charlas`);
  revalidatePath(`/eventos/${proposal.eventId}/propuestas-de-charlas`);
  revalidatePath('/charlas');

  return { success: true, talkId: talk.id, alreadyExists: false };
};
