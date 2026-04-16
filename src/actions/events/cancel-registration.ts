'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { notifyAdmins } from '@/actions/notifications/notify-admins';
import { promoteNextFromWaitlist } from '@/actions/events/event-capacity';

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
  let waitlistEntry = null;

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
    waitlistEntry = await prisma.eventWaitlistEntry.findFirst({
      where: {
        eventId: eventId,
        userId: session.userId,
        cancelledAt: null,
        promotedAt: null,
      },
      include: {
        user: true,
      },
    });
  }

  if (!registration && !waitlistEntry) {
    throw new Error('No se encontró una inscripción activa ni una inscripción fuera de cupo');
  }

  const targetUser = registration?.user || waitlistEntry?.user;
  const userName = targetUser?.name || session.user.name;
  const userEmail = targetUser?.email || session.user.email;

  if (registration) {
    await prisma.eventRegistration.update({
      where: { id: registration.id },
      data: {
        cancelledAt: new Date(),
      },
    });

    const promoted = await promoteNextFromWaitlist(eventId);
    if (promoted) {
      await notifyAdmins({
        type: 'event_waitlist_promoted',
        title: 'Promoción automática desde lista de espera',
        message: `${promoted.userName} obtuvo un cupo en "${event.name}"`,
        metadata: {
          eventId,
          eventName: event.name,
          registrationId: promoted.registrationId,
          userId: promoted.userId,
          userName: promoted.userName,
          userEmail: promoted.userEmail,
        },
      });
    }
  }

  if (waitlistEntry) {
    await prisma.eventWaitlistEntry.update({
      where: { id: waitlistEntry.id },
      data: {
        cancelledAt: new Date(),
      },
    });
  }

  await notifyAdmins(
    registration
      ? {
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
        }
      : {
          type: 'event_waitlist_cancelled',
          title: 'Salida de lista de espera',
          message: `${userName} salió de la lista de espera del evento "${event.name}"`,
          metadata: {
            eventId: eventId,
            eventName: event.name,
            waitlistId: waitlistEntry!.id,
            userName: userName,
            userEmail: userEmail,
          },
        },
  );

  revalidatePath(`/eventos/${eventId}`);
  return { success: true, status: registration ? 'cancelled_registration' : 'cancelled_waitlist' };
};
