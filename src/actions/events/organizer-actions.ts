'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { canManageEventOrganizers } from '@/lib/event-permissions';

// Los organizadores los suman y quitan los admins del sitio y quien creó el evento.
async function requireOrganizersManager(eventId: string) {
  const user = (await getCurrentSession())?.user;
  if (!user) throw new Error('No autorizado');

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { createdById: true, deletedAt: true, organizers: { select: { userId: true } } },
  });
  if (!event) throw new Error('Evento no encontrado');
  if (!canManageEventOrganizers(user, event)) throw new Error('No autorizado');
}

const revalidateOrganizers = (eventId: string, userId: string) => {
  revalidatePath(`/eventos/${eventId}`);
  revalidatePath(`/eventos/${eventId}/organizadores`);
  revalidatePath(`/perfil/${userId}`);
};

/** Suma a un usuario (ambassador o no) como organizador del evento. */
export async function addEventOrganizer(eventId: string, userId: string) {
  await requireOrganizersManager(eventId);

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) throw new Error('Usuario no encontrado');

  await prisma.eventOrganizer.upsert({
    where: { eventId_userId: { eventId, userId } },
    create: { eventId, userId },
    update: {},
  });
  revalidateOrganizers(eventId, userId);
  return { success: true };
}

/** Quita a un organizador del evento. */
export async function removeEventOrganizer(eventId: string, userId: string) {
  await requireOrganizersManager(eventId);

  await prisma.eventOrganizer.deleteMany({ where: { eventId, userId } });
  revalidateOrganizers(eventId, userId);
  return { success: true };
}
