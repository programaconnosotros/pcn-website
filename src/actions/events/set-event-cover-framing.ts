'use server';

import { revalidatePath } from 'next/cache';
import { requireEventManager } from '@/lib/event-access';
import { coverFramingSchema, type CoverFraming } from '@/lib/cover-framing';
import prisma from '@/lib/prisma';

/**
 * Ajusta el encuadre de la portada del memorial (punto focal y zoom). Quien puede editar el
 * evento: admins y sus organizadores.
 */
export async function setEventCoverFraming(eventId: string, framing: CoverFraming) {
  await requireEventManager(eventId);
  const parsed = coverFramingSchema.safeParse(framing);
  if (!parsed.success) throw new Error('Encuadre inválido');

  const event = await prisma.event.findFirst({
    where: { id: eventId, deletedAt: null },
    select: { id: true },
  });
  if (!event) throw new Error('Evento no encontrado');

  const { x, y, zoom } = parsed.data;
  await prisma.event.update({
    where: { id: eventId },
    data: { coverFocusX: x, coverFocusY: y, coverZoom: zoom },
  });

  revalidatePath(`/eventos/${eventId}`);
}
