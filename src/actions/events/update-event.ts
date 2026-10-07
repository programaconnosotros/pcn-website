'use server';

import prisma from '@/lib/prisma';
import { eventSchema, EventFormData } from '@/schemas/event-schema';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { canEditEvent } from '@/lib/event-permissions';
import { enforceRateLimit } from '@/lib/rate-limit';
import { findSession } from '@/lib/session';
import { fillFromWaitlist } from '@/lib/event-waitlist';

/**
 * Designers of the event's flyer, deduplicated, with only user ids that exist (a stale id is
 * kept as a plain name). None when the event has no flyer left.
 */
const flyerDesignerRows = async (
  designers: { userId?: string | null; name: string }[],
  flyers: string[],
) => {
  const kept = flyers.length > 0 ? designers : [];
  const ids = [...new Set(kept.flatMap((designer) => (designer.userId ? [designer.userId] : [])))];
  const existing = new Set(
    ids.length
      ? (await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true } })).map(
          (user) => user.id,
        )
      : [],
  );
  const seen = new Set<string>();
  return kept.flatMap(({ userId, name }) => {
    const key = userId ?? `name:${name.toLowerCase()}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ name, userId: userId && existing.has(userId) ? userId : null }];
  });
};

export const updateEvent = async (id: string, data: EventFormData) => {
  await enforceRateLimit('editContent');

  const validatedData = eventSchema.parse(data);

  const sessionId = (await cookies()).get('sessionId')?.value;

  if (!sessionId) {
    throw new Error('Usuario no autenticado');
  }

  const session = await findSession(sessionId);

  if (!session) {
    throw new Error('Sesión no encontrada');
  }

  // Verificar que el evento existe
  const existingEvent = await prisma.event.findUnique({
    where: { id },
    include: { organizers: { select: { userId: true } } },
  });

  if (!existingEvent) {
    throw new Error('Evento no encontrado');
  }

  if (!canEditEvent(session.user, existingEvent)) {
    throw new Error('No tienes permisos para editar este evento');
  }

  // Convertir las fechas de string a Date
  const date = new Date(validatedData.date);
  const endDate = validatedData.endDate ? new Date(validatedData.endDate) : null;

  // Validar que endDate sea posterior a date si está presente
  if (endDate && endDate <= date) {
    throw new Error('La fecha de finalización debe ser posterior a la fecha de inicio');
  }

  const { sponsors, flyerDesigners, ...eventData } = validatedData;
  const designers = await flyerDesignerRows(flyerDesigners, eventData.flyerImages);

  // Reemplazar sponsors existentes por los nuevos
  await prisma.$transaction([
    prisma.sponsor.deleteMany({
      where: { eventId: id },
    }),
    prisma.eventFlyerDesigner.deleteMany({ where: { eventId: id } }),
    prisma.event.update({
      where: { id },
      data: {
        ...eventData,
        date: date,
        endDate: endDate,
        googleMapsUrl: validatedData.googleMapsUrl ?? null,
        capacity: validatedData.capacity ?? null,
        flyerDesigners: { create: designers },
        sponsors: {
          create:
            sponsors
              ?.filter((s) => s.name.trim() !== '')
              .map((sponsor) => ({
                name: sponsor.name,
                website: sponsor.website && sponsor.website.trim() !== '' ? sponsor.website : null,
                logo: sponsor.logo ?? null,
              })) || [],
        },
      },
    }),
  ]);

  // Si el cambio liberó lugares (más cupo o ya no está marcado como lleno), pasan a quienes esperan
  await fillFromWaitlist(id);

  revalidatePath('/eventos');
  revalidatePath(`/eventos/${id}`);
  redirect(`/eventos/${id}`);
};
