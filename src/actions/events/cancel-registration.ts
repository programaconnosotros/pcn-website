'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { notifyAdmins } from '@/actions/notifications/notify-admins';

type CancelRegistrationParams = {
  registrationId?: string;
  eventId: string;
};

export const cancelRegistration = async (params: CancelRegistrationParams) => {
  const { registrationId, eventId } = params;

  // Verificar autenticación
  const sessionId = cookies().get('sessionId')?.value;
  if (!sessionId) {
    throw new Error('No autorizado');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session?.user) {
    throw new Error('No autorizado');
  }

  // Verificar que el evento existe
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      deletedAt: null,
    },
  });

  if (!event) {
    throw new Error('Evento no encontrado');
  }

  let registration = null;

  // Si hay registrationId, verificar que pertenece al usuario
  if (registrationId) {
    registration = await prisma.eventRegistration.findFirst({
      where: {
        id: registrationId,
        eventId: eventId,
        userId: session.userId,
        cancelledAt: null, // Solo cancelar si no está ya cancelada
      },
      include: { user: true },
    });
  } else {
    // Buscar inscripción del usuario actual
    registration = await prisma.eventRegistration.findFirst({
      where: {
        eventId: eventId,
        userId: session.userId,
        cancelledAt: null,
      },
      include: { user: true },
    });
  }

  if (!registration) {
    throw new Error('Inscripción no encontrada o ya cancelada');
  }

  const userName = registration.user.name;
  const userEmail = registration.user.email;

  // Marcar como cancelada (no eliminar)
  await prisma.eventRegistration.update({
    where: { id: registration.id },
    data: {
      cancelledAt: new Date(),
    },
  });

  // Notificar a los admins sobre la cancelación
  await notifyAdmins({
    type: 'event_registration_cancelled',
    title: 'Inscripción cancelada',
    message: `${userName} ha cancelado su inscripción al evento "${event.name}"`,
    metadata: {
      eventId: eventId,
      eventName: event.name,
      registrationId: registration.id,
      userName: userName,
      userEmail: userEmail,
    },
  });

  revalidatePath(`/eventos/${eventId}`);
  return { success: true };
};
