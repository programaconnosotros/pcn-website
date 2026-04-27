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
    include: { talk: true },
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
      speakerName: proposal.speakerName,
      speakerPhone: proposal.speakerPhone,
      isProfessional: proposal.isProfessional,
      jobTitle: proposal.jobTitle,
      enterprise: proposal.enterprise,
      isStudent: proposal.isStudent,
      career: proposal.career,
      studyPlace: proposal.studyPlace,
    },
  });

  revalidatePath(`/eventos/${proposal.eventId}/charlas`);
  revalidatePath(`/eventos/${proposal.eventId}/propuestas-de-charlas`);

  return { success: true, talkId: talk.id, alreadyExists: false };
};
