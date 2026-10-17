'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { notifyAdmins } from '@/actions/notifications/notify-admins';
import { enforceRateLimit } from '@/lib/rate-limit';
import { findSession } from '@/lib/session';
import {
  activeWaitlistWhere,
  lockEvent,
  notifyPromotions,
  promoteFromWaitlist,
} from '@/lib/event-waitlist';

type CancelRegistrationParams = {
  registrationId?: string;
  eventId: string;
};

export const cancelRegistration = async (params: CancelRegistrationParams) => {
  await enforceRateLimit('eventRegistration');

  const { registrationId, eventId } = params;

  // Verificar autenticación
  const sessionId = (await cookies()).get('sessionId')?.value;
  if (!sessionId) {
    throw new Error('No autorizado');
  }

  const session = await findSession(sessionId);

  if (!session?.user) {
    throw new Error('No autorizado');
  }

  const userName = session.user.name;
  const userEmail = session.user.email;

  const outcome = await prisma.$transaction(async (tx) => {
    // Bloquear el evento: la baja y la promoción de quien espera pasan juntas
    const event = await lockEvent(tx, eventId);

    if (!event) {
      throw new Error('Evento no encontrado');
    }

    // Si hay registrationId, verificar que pertenece al usuario
    const registration = await tx.eventRegistration.findFirst({
      where: {
        ...(registrationId ? { id: registrationId } : {}),
        eventId,
        userId: session.userId,
        cancelledAt: null, // Solo cancelar si no está ya cancelada
      },
    });

    if (registration) {
      // Marcar como cancelada (no eliminar)
      await tx.eventRegistration.update({
        where: { id: registration.id },
        data: { cancelledAt: new Date() },
      });

      return {
        event,
        status: 'cancelled_registration' as const,
        id: registration.id,
        promoted: await promoteFromWaitlist(tx, event),
      };
    }

    // Sin inscripción activa: puede que esté saliendo de la lista de espera
    const waitlistEntry = await tx.eventWaitlistEntry.findFirst({
      where: { ...activeWaitlistWhere(eventId), userId: session.userId },
    });

    if (!waitlistEntry) {
      throw new Error('Inscripción no encontrada o ya cancelada');
    }

    await tx.eventWaitlistEntry.update({
      where: { id: waitlistEntry.id },
      data: { cancelledAt: new Date() },
    });

    return {
      event,
      status: 'cancelled_waitlist' as const,
      id: waitlistEntry.id,
      promoted: [],
    };
  });

  const { event, status, id, promoted } = outcome;

  // Notificar a los admins sobre la cancelación
  if (status === 'cancelled_registration') {
    await notifyAdmins({
      type: 'event_registration_cancelled',
      title: 'Inscripción cancelada',
      message: `${userName} ha cancelado su inscripción al evento "${event.name}"`,
      metadata: {
        eventId,
        eventName: event.name,
        registrationId: id,
        userName,
        userEmail,
      },
    });
  } else {
    await notifyAdmins({
      type: 'event_waitlist_cancelled',
      title: 'Salida de lista de espera',
      message: `${userName} salió de la lista de espera del evento "${event.name}"`,
      metadata: {
        eventId,
        eventName: event.name,
        waitlistId: id,
        userName,
        userEmail,
      },
    });
  }

  if (promoted.length > 0) {
    await notifyPromotions(event, promoted);
  }

  revalidatePath(`/eventos/${eventId}`);
  return { success: true, status };
};
