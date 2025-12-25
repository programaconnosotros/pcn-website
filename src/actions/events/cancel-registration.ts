'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { notifyAdmins } from '@/actions/notifications/notify-admins';

type CancelRegistrationParams = {
  registrationId?: string;
  eventId: string;
  email?: string;
};

export const cancelRegistration = async (params: CancelRegistrationParams) => {
  const { registrationId, eventId, email } = params;

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

  // Si hay registrationId, el usuario está logueado
  if (registrationId) {
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

    // Verificar que la inscripción pertenece al usuario
    registration = await prisma.eventRegistration.findFirst({
      where: {
        id: registrationId,
        eventId: eventId,
        userId: session.userId,
        cancelledAt: null, // Solo cancelar si no está ya cancelada
      },
    });

    if (!registration) {
      throw new Error('Inscripción no encontrada o ya cancelada');
    }
  } else if (email) {
    // Si no está logueado, buscar por email
    registration = await prisma.eventRegistration.findFirst({
      where: {
        eventId: eventId,
        email: email,
        cancelledAt: null, // Solo cancelar si no está ya cancelada
      },
    });

    if (!registration) {
      throw new Error('No se encontró una inscripción con ese correo electrónico para este evento');
    }
  } else {
    throw new Error('Debes proporcionar un ID de inscripción o un correo electrónico');
  }

  // Obtener información del usuario para la notificación
  let userName: string | undefined = undefined;
  if (registration.userId) {
    const user = await prisma.user.findUnique({
      where: { id: registration.userId },
      select: { name: true },
    });
    userName = user?.name;
  }

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
    message: `${userName || `${registration.firstName} ${registration.lastName}`} ha cancelado su inscripción al evento "${event.name}"`,
    metadata: {
      eventId: eventId,
      eventName: event.name,
      registrationId: registration.id,
      userName: userName || `${registration.firstName} ${registration.lastName}`,
      userEmail: registration.email,
    },
  });

  revalidatePath(`/eventos/${eventId}`);
  return { success: true };
};
