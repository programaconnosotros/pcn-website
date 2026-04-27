'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { talkSchema, TalkFormData } from '@/schemas/talk-schema';

export const createTalk = async (data: TalkFormData) => {
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

  const talk = await prisma.talk.create({
    data: {
      eventId: talkData.eventId ?? null,
      title: talkData.title,
      description: talkData.description,
      order: talkData.order,
      portraitUrl: talkData.portraitUrl ?? null,
      slidesUrl: talkData.slidesUrl,
      slideImages: talkData.slideImages ?? [],
      videoUrl: talkData.videoUrl,
      speakers: {
        create: talkData.speakers.map((s, idx) => ({
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

  if (talkData.eventId) {
    revalidatePath(`/eventos/${talkData.eventId}/charlas`);
  }
  revalidatePath('/charlas');

  return { success: true, talkId: talk.id };
};
