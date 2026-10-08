'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getObjectBuffer, keyFromPublicUrl } from '@/lib/s3';
import { talkSchema, type TalkFormData } from '@/schemas/talk-schema';
import { talkAgent, type TalkDraft } from '@/lib/talk-agent';
import { MISSING_AGENT_KEY, imageForModel } from '@/lib/agents';

// La carpeta donde el form de charlas sube las fotos: el agente no lee nada fuera de ella.
const PORTRAITS_FOLDER = 'talks/portraits/';

export type CreateTalkFromPhotoResult =
  | { status: 'created'; talkId: string; title: string; reason: string }
  // Encontró la charla pero le faltan datos que pide el form: el admin los completa ahí.
  | { status: 'draft'; draft: TalkFormData; reason: string }
  | { status: 'failed'; reason: string };

/** Cuándo se sacó la foto, según su EXIF. WhatsApp y otras apps lo borran. */
const photoTakenAt = async (buffer: Buffer) => {
  try {
    const { default: exifr } = await import('exifr');
    const exif = await exifr.parse(buffer, ['DateTimeOriginal', 'CreateDate']);
    const date = exif?.DateTimeOriginal ?? exif?.CreateDate;
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  } catch {
    return null;
  }
};

/** Lo que devolvió el agente con la forma del form de charlas, que valida talkSchema. */
const toFormData = (draft: TalkDraft, portraitUrl: string): TalkFormData => ({
  eventId: draft.eventId,
  title: draft.title,
  description: draft.description,
  portraitUrl,
  order: 0,
  slideImages: [],
  speakers: draft.speakers.map((speaker) => ({
    userId: speaker.userId,
    speakerName: speaker.speakerName,
    speakerPhone: '',
    isProfessional: speaker.isProfessional,
    jobTitle: speaker.jobTitle ?? '',
    enterprise: speaker.enterprise ?? '',
    isStudent: speaker.isStudent,
    career: speaker.career ?? '',
    studyPlace: speaker.studyPlace ?? '',
  })),
});

/**
 * Los IDs que inventa o confunde el modelo no llegan a la base: el evento tiene que existir, la
 * propuesta ser de ese evento y no tener charla, y cada userId ser de un usuario. El teléfono de
 * cada orador sale de la propuesta o de su perfil, que el modelo nunca ve.
 */
const checkReferences = async (draft: TalkDraft) => {
  if (!draft.eventId) return { error: 'No se identificó el evento de la charla' };

  const event = await prisma.event.findFirst({
    where: { id: draft.eventId, deletedAt: null },
    select: { id: true },
  });
  if (!event) return { error: 'El evento que eligió el agente no existe' };

  const proposal = draft.proposalId
    ? await prisma.talkProposal.findFirst({
        where: { id: draft.proposalId, eventId: event.id },
        select: {
          id: true,
          talk: { select: { id: true } },
          speakers: {
            select: { userId: true, speakerName: true, speakerPhone: true },
            omit: { speakerPhone: false },
          },
        },
      })
    : null;
  if (proposal?.talk) return { error: 'Esa charla ya está cargada' };

  const userIds = draft.speakers.flatMap((s) => (s.userId ? [s.userId] : []));
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, phoneNumber: true },
  });

  const speakers = draft.speakers.map((speaker) => {
    const user = users.find((u) => u.id === speaker.userId);
    const fromProposal = proposal?.speakers.find(
      (s) =>
        (user && s.userId === user.id) ||
        s.speakerName.trim().toLowerCase() === speaker.speakerName.trim().toLowerCase(),
    );
    return {
      ...speaker,
      userId: user?.id ?? null,
      phone: fromProposal?.speakerPhone || user?.phoneNumber || '',
    };
  });

  return { eventId: event.id, proposalId: proposal?.id ?? null, speakers };
};

/**
 * Crea una charla a partir de su foto: el agente deduce el evento, la propuesta, el título, la
 * descripción y los oradores. Si le faltan datos, devuelve el borrador para completarlo a mano.
 */
export const createTalkFromPhoto = async (photoUrl: string): Promise<CreateTalkFromPhotoResult> => {
  await requireAdmin();
  await enforceRateLimit('aiAgent');

  const key = typeof photoUrl === 'string' ? keyFromPublicUrl(photoUrl) : null;
  if (!key?.startsWith(PORTRAITS_FOLDER)) {
    return { status: 'failed', reason: 'La foto tiene que estar subida desde este formulario' };
  }

  if (!process.env.AI_GATEWAY_API_KEY) {
    return { status: 'failed', reason: MISSING_AGENT_KEY };
  }

  const original = await getObjectBuffer(key);
  const [takenAt, image] = await Promise.all([photoTakenAt(original), imageForModel(original)]);

  let draft: TalkDraft;
  try {
    const { output } = await talkAgent.generate({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: [
                `Hoy es ${new Date().toISOString().slice(0, 10)}.`,
                takenAt
                  ? `La foto se sacó el ${takenAt.toISOString().slice(0, 10)}.`
                  : 'La foto no trae la fecha en que se sacó.',
                'Identificá la charla de esta foto.',
              ].join(' '),
            },
            { type: 'file', mediaType: 'image/jpeg', data: image },
          ],
        },
      ],
      timeout: 3 * 60 * 1000,
    });
    draft = output;
  } catch (error) {
    console.error('[talk-agent]', error);
    return { status: 'failed', reason: 'El agente no pudo analizar la foto. Probá de nuevo.' };
  }

  if (!draft.found) return { status: 'failed', reason: draft.reason };

  const refs = await checkReferences(draft);
  if ('error' in refs) return { status: 'failed', reason: refs.error ?? draft.reason };

  const formData = toFormData(
    {
      ...draft,
      eventId: refs.eventId,
      speakers: refs.speakers.map(({ phone: _phone, ...speaker }) => speaker),
    },
    photoUrl,
  );
  const parsed = talkSchema.safeParse(formData);
  if (!parsed.success) return { status: 'draft', draft: formData, reason: draft.reason };

  const talk = await prisma.talk
    .create({
      data: {
        eventId: refs.eventId,
        proposalId: refs.proposalId,
        title: parsed.data.title,
        description: parsed.data.description,
        portraitUrl: photoUrl,
        speakers: {
          create: parsed.data.speakers.map((s, idx) => ({
            userId: s.userId ?? null,
            speakerName: s.speakerName,
            speakerPhone: refs.speakers[idx].phone,
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
    // Dos cargas de la misma propuesta a la vez: la segunda choca con el proposalId único.
    .catch((error: unknown) => {
      if ((error as { code?: string }).code !== 'P2002') throw error;
      return null;
    });
  if (!talk) return { status: 'failed', reason: 'Esa charla ya está cargada' };

  revalidatePath(`/eventos/${refs.eventId}/charlas`);
  revalidatePath('/charlas');

  return { status: 'created', talkId: talk.id, title: talk.title, reason: draft.reason };
};
