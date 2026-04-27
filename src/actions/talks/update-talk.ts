'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { talkSchema, TalkFormData } from '@/schemas/talk-schema';

export const updateTalk = async (id: string, data: TalkFormData) => {
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

  const parsed = talkSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? 'Datos inválidos');
  }

  const talkData = parsed.data;

  const existing = await prisma.talk.findUnique({ where: { id } });
  if (!existing) {
    throw new Error('Charla no encontrada');
  }

  await prisma.talk.update({
    where: { id },
    data: {
      eventId: talkData.eventId ?? null,
      title: talkData.title,
      description: talkData.description,
      speakerName: talkData.speakerName,
      speakerPhone: talkData.speakerPhone,
      isProfessional: talkData.isProfessional,
      jobTitle: talkData.jobTitle,
      enterprise: talkData.enterprise,
      isStudent: talkData.isStudent,
      career: talkData.career,
      studyPlace: talkData.studyPlace,
      order: talkData.order,
      slidesUrl: talkData.slidesUrl,
      videoUrl: talkData.videoUrl,
    },
  });

  const eventId = talkData.eventId ?? existing.eventId;
  if (eventId) {
    revalidatePath(`/eventos/${eventId}/charlas`);
  }

  return { success: true };
};
