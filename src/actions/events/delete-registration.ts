'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { promoteNextFromWaitlist } from '@/actions/events/event-capacity';
import { notifyAdmins } from '@/actions/notifications/notify-admins';

export const deleteRegistration = async (registrationId: string) => {
  // Verificar que el usuario es admin
  const sessionId = cookies().get('sessionId')?.value;
  if (!sessionId) {
    throw new Error('No autorizado');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('No tienes permisos para realizar esta acción');
  }

  // Obtener la inscripción para saber el eventId
  const registration = await prisma.eventRegistration.findUnique({
    where: { id: registrationId },
  });

  if (!registration) {
    throw new Error('Inscripción no encontrada');
  }

  // Eliminar la inscripción físicamente
  await prisma.eventRegistration.delete({
    where: { id: registrationId },
  });

  const event = await prisma.event.findUnique({
    where: { id: registration.eventId },
    select: { name: true },
  });

  const promoted = await promoteNextFromWaitlist(registration.eventId);
  if (promoted && event) {
    await notifyAdmins({
      type: 'event_waitlist_promoted',
      title: 'Promoción automática desde lista de espera',
      message: `${promoted.userName} obtuvo un cupo en "${event.name}"`,
      metadata: {
        eventId: registration.eventId,
        eventName: event.name,
        registrationId: promoted.registrationId,
        userId: promoted.userId,
        userName: promoted.userName,
        userEmail: promoted.userEmail,
      },
    });
  }

  revalidatePath(`/eventos/${registration.eventId}`);
  return { success: true };
};
