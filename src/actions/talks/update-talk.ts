'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { canManageEventById, canManageSomeEvent } from '@/lib/event-access';
import { talkSchema, TalkFormData } from '@/schemas/talk-schema';
import { findSession } from '@/lib/session';
import { notifySpeakers } from './notify-speakers';

export const updateTalk = async (id: string, data: TalkFormData) => {
  const sessionId = (await cookies()).get('sessionId')?.value;
  if (!sessionId) {
    throw new Error('Debes estar autenticado');
  }

  const session = await findSession(sessionId);

  // Admins y quienes gestionan eventos; el evento puntual se valida más abajo
  if (!session || !(await canManageSomeEvent(session.user))) {
    throw new Error('No tenés permisos para realizar esta acción');
  }

  const parsed = talkSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Datos inválidos');
  }

  const talkData = parsed.data;

  const existing = await prisma.talk.findUnique({
    where: { id },
    include: { speakers: { select: { userId: true } } },
  });
  if (!existing) {
    throw new Error('Charla no encontrada');
  }

  // Quien gestiona un evento edita sus charlas, sin moverlas a eventos que no gestiona
  const canManage =
    (await canManageEventById(session.user, existing.eventId)) &&
    (talkData.eventId === existing.eventId ||
      (await canManageEventById(session.user, talkData.eventId)));
  if (!canManage) {
    throw new Error('No tenés permisos para realizar esta acción');
  }

  await prisma.$transaction([
    prisma.talk.update({
      where: { id },
      data: {
        eventId: talkData.eventId ?? null,
        title: talkData.title,
        description: talkData.description,
        manualEventTitle: talkData.manualEventTitle ?? null,
        manualEventDate: talkData.manualEventDate ?? null,
        manualEventLocation: talkData.manualEventLocation ?? null,
        order: talkData.order,
        portraitUrl: talkData.portraitUrl ?? null,
        slidesUrl: talkData.slidesUrl,
        slideImages: talkData.slideImages ?? [],
        videoUrl: talkData.videoUrl,
      },
    }),
    prisma.talkSpeaker.deleteMany({ where: { talkId: id } }),
    prisma.talkSpeaker.createMany({
      data: talkData.speakers.map((s, idx) => ({
        talkId: id,
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
    }),
  ]);

  // Solo a quienes no eran speakers antes de esta edición.
  const previousSpeakers = new Set(existing.speakers.map((s) => s.userId));
  await notifySpeakers(
    talkData.speakers
      .map((s) => s.userId)
      .filter((userId) => !previousSpeakers.has(userId ?? null)),
    { id, title: talkData.title, eventId: talkData.eventId ?? null },
    session.user,
  );

  const eventId = talkData.eventId ?? existing.eventId;
  if (eventId) {
    revalidatePath(`/eventos/${eventId}/charlas`);
  }
  revalidatePath('/charlas');

  return { success: true };
};
