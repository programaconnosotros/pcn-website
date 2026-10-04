'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { notifyAdmins } from '@/actions/notifications/notify-admins';
import { enforceRateLimit } from '@/lib/rate-limit';
import { findSession } from '@/lib/session';
import { hasEventEnded } from '@/lib/event-status';
import {
  activeWaitlistWhere,
  lockEvent,
  notifyPromotions,
  promoteFromWaitlist,
} from '@/lib/event-waitlist';

export type RegistrationResult =
  | { success: true; status: 'registered'; registrationId: string }
  | { success: true; status: 'waitlisted'; waitlistId: string; position: number };

export const registerEvent = async (
  eventId: string,
  options?: { skipRedirect?: boolean },
): Promise<RegistrationResult> => {
  await enforceRateLimit('eventRegistration');

  // Requerir autenticación - solo usuarios autenticados pueden inscribirse
  const sessionId = (await cookies()).get('sessionId')?.value;
  if (!sessionId) {
    throw new Error('Debes estar autenticado para inscribirte a un evento');
  }

  const session = await findSession(sessionId);

  if (!session) {
    throw new Error('Sesión no válida. Por favor, inicia sesión nuevamente');
  }

  const userId = session.userId;
  const userName = session.user.name;
  const userEmail = session.user.email;

  let outcome;
  try {
    outcome = await prisma.$transaction(async (tx) => {
      // Bloquear el evento: el chequeo de cupo y el alta pasan sin que nadie más se meta
      const event = await lockEvent(tx, eventId);

      if (!event) {
        throw new Error('Evento no encontrado');
      }

      if (event.externalRegistrationUrl) {
        throw new Error('La inscripción a este evento se hace en un sitio externo');
      }

      // Un evento que ya terminó no acepta inscripciones (y no deben contar como asistencia)
      if (hasEventEnded(event)) {
        throw new Error('Este evento ya terminó');
      }

      // Si quedó algún lugar libre, primero es de quienes ya estaban esperando
      const promoted = await promoteFromWaitlist(tx, event);

      const existingRegistration = await tx.eventRegistration.findFirst({
        where: { eventId, userId },
      });

      if (existingRegistration && existingRegistration.cancelledAt === null) {
        throw new Error('Ya estás registrado en este evento');
      }

      const existingWaitlist = await tx.eventWaitlistEntry.findFirst({
        where: { eventId, userId },
      });

      if (existingWaitlist && !existingWaitlist.cancelledAt && !existingWaitlist.promotedAt) {
        throw new Error('Ya estás en la lista de espera de este evento');
      }

      const activeRegistrations =
        event.capacity !== null
          ? await tx.eventRegistration.count({ where: { eventId, cancelledAt: null } })
          : 0;

      const isFull =
        event.markedAsFull || (event.capacity !== null && activeRegistrations >= event.capacity);

      if (!isFull) {
        // Si existe una inscripción cancelada, reactivarla
        const registration = existingRegistration
          ? await tx.eventRegistration.update({
              where: { id: existingRegistration.id },
              data: { cancelledAt: null },
            })
          : await tx.eventRegistration.create({ data: { eventId, userId } });

        return {
          event,
          promoted,
          result: {
            success: true,
            status: 'registered',
            registrationId: registration.id,
          } as RegistrationResult,
        };
      }

      // Sin lugar: a la lista de espera. Quien vuelve a anotarse entra al final de la fila.
      const entry = existingWaitlist
        ? await tx.eventWaitlistEntry.update({
            where: { id: existingWaitlist.id },
            data: { cancelledAt: null, promotedAt: null, createdAt: new Date() },
          })
        : await tx.eventWaitlistEntry.create({ data: { eventId, userId } });

      const ahead = await tx.eventWaitlistEntry.count({
        where: { ...activeWaitlistWhere(eventId), createdAt: { lt: entry.createdAt } },
      });

      return {
        event,
        promoted,
        result: {
          success: true,
          status: 'waitlisted',
          waitlistId: entry.id,
          position: ahead + 1,
        } as RegistrationResult,
      };
    });
  } catch (error: any) {
    // Constraint único de Prisma: dos pedidos del mismo usuario casi a la vez
    if (error?.code === 'P2002') {
      throw new Error('Ya estás inscripto en este evento o en su lista de espera');
    }
    throw error;
  }

  const { event, promoted, result } = outcome;

  if (promoted.length > 0) {
    await notifyPromotions(event, promoted);
  }

  if (result.status === 'registered') {
    // Notificar a los admins sobre la nueva inscripción
    await notifyAdmins({
      type: 'event_registration_created',
      title: 'Nueva inscripción a evento',
      message: `${userName} se ha inscrito al evento "${event.name}"`,
      metadata: {
        eventId,
        eventName: event.name,
        registrationId: result.registrationId,
        userName,
        userEmail,
      },
    });
  } else {
    await notifyAdmins({
      type: 'event_waitlist_joined',
      title: 'Nueva persona en lista de espera',
      message: `${userName} se sumó a la lista de espera del evento "${event.name}"`,
      metadata: {
        eventId,
        eventName: event.name,
        waitlistId: result.waitlistId,
        waitlistPosition: result.position,
        userName,
        userEmail,
      },
    });
  }

  revalidatePath(`/eventos/${eventId}`);

  // Si skipRedirect es true, no redirigir (útil para inscripción automática desde el botón)
  if (options?.skipRedirect) {
    return result;
  }

  redirect(
    `/eventos/${eventId}?${result.status === 'registered' ? 'registered' : 'waitlisted'}=true`,
  );
};
