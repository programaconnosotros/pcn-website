'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export const createTalkFromProposal = async (proposalId: string) => {
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

  const proposal = await prisma.talkProposal.findUnique({
    where: { id: proposalId },
    include: { talk: true, speakers: { orderBy: { order: 'asc' } } },
  });

  if (!proposal) {
    throw new Error('Propuesta no encontrada');
  }

  if (proposal.talk) {
    return { success: true, talkId: proposal.talk.id, alreadyExists: true };
  }

  const talk = await prisma.talk.create({
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
  });

  revalidatePath(`/eventos/${proposal.eventId}/charlas`);
  revalidatePath(`/eventos/${proposal.eventId}/propuestas-de-charlas`);
  revalidatePath('/charlas');

  return { success: true, talkId: talk.id, alreadyExists: false };
};
