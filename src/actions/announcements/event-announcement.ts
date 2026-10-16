'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireEventManager } from '@/lib/event-access';
import { enforceRateLimit } from '@/lib/rate-limit';
import { notifyEventAnnouncement } from '@/actions/notifications/event-announcement-notice';

// Anuncios que publica quien gestiona un evento (admins, quien lo creó siendo ambassador y sus
// organizadores) desde la página del evento: salen ahí y les llegan a todos los inscriptos, como
// notificación y por email.

const eventAnnouncementSchema = z.object({
  eventId: z.string().min(1),
  title: z
    .string()
    .trim()
    .min(3, { message: 'El título debe tener al menos 3 caracteres' })
    .max(200, { message: 'El título no puede exceder 200 caracteres' }),
  content: z
    .string()
    .trim()
    .min(10, { message: 'El contenido debe tener al menos 10 caracteres' })
    .max(5000, { message: 'El contenido no puede exceder 5000 caracteres' }),
  pinned: z.boolean().default(false),
});

export type EventAnnouncementInput = z.input<typeof eventAnnouncementSchema>;

export async function createEventAnnouncement(input: EventAnnouncementInput) {
  await enforceRateLimit('createContent');

  const { eventId, title, content, pinned } = eventAnnouncementSchema.parse(input);
  const user = await requireEventManager(eventId);

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { name: true, deletedAt: true },
  });
  if (!event || event.deletedAt) throw new Error('Evento no encontrado');

  const announcement = await prisma.announcement.create({
    data: {
      title,
      content,
      pinned,
      category: 'evento',
      published: true,
      authorId: user.id,
      eventId,
    },
  });

  const notified = await notifyEventAnnouncement(
    { id: eventId, name: event.name },
    { id: announcement.id, title, content },
    user.id,
  );

  revalidatePath(`/eventos/${eventId}`);
  revalidatePath('/anuncios');

  return { id: announcement.id, notified };
}

export async function deleteEventAnnouncement(announcementId: string) {
  const id = z.string().min(1).parse(announcementId);

  const announcement = await prisma.announcement.findUnique({
    where: { id },
    select: { eventId: true },
  });
  // Solo los anuncios de un evento: los generales siguen siendo cosa de los admins en /anuncios.
  if (!announcement?.eventId) throw new Error('Anuncio no encontrado');

  await requireEventManager(announcement.eventId);

  await prisma.announcement.delete({ where: { id } });

  revalidatePath(`/eventos/${announcement.eventId}`);
  revalidatePath('/anuncios');
}
