'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { talkProposalSchema, TalkProposalFormData } from '@/schemas/talk-proposal-schema';
import { notifyAdmins } from '@/actions/notifications/notify-admins';

export const createTalkProposal = async (eventId: string, data: TalkProposalFormData) => {
  const event = await prisma.event.findFirst({
    where: { id: eventId, deletedAt: null },
  });

  if (!event) {
    throw new Error('Evento no encontrado');
  }

  if (!event.callForSpeakersEnabled) {
    throw new Error('Este evento no tiene call for speakers habilitado');
  }

  const sessionId = (await cookies()).get('sessionId')?.value;
  if (!sessionId) {
    throw new Error('Debes estar autenticado para proponer una charla');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session) {
    throw new Error('Sesión no válida. Por favor, inicia sesión nuevamente');
  }

  const parsed = talkProposalSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? 'Datos inválidos');
  }

  const proposalData = parsed.data;

  const proposal = await prisma.talkProposal.create({
    data: {
      eventId,
      userId: session.user.id,
      title: proposalData.title,
      description: proposalData.description,
      speakers: {
        create: proposalData.speakers.map((s, idx) => ({
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

  const speakerNames = proposalData.speakers.map((s) => s.speakerName).join(', ');

  await notifyAdmins({
    type: 'talk_proposal_created',
    title: 'Nueva propuesta de charla',
    message: `${session.user.name} propuso la charla "${proposalData.title}" para el evento "${event.name}"`,
    metadata: {
      eventId,
      eventName: event.name,
      talkProposalId: proposal.id,
      speakerNames,
    },
  });

  revalidatePath(`/eventos/${eventId}/propuestas-de-charlas`);

  return { success: true, proposalId: proposal.id };
};
