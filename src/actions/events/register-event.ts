'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { notifyAdmins } from '@/actions/notifications/notify-admins';

export const registerEvent = async (
  eventId: string,
  options?: { skipRedirect?: boolean },
): Promise<{ success: true; registrationId?: string; status: 'registered' | 'waitlisted' }> => {
  // Verificar autenticación antes de la transacción
  const sessionId = cookies().get('sessionId')?.value;
  if (!sessionId) {
    throw new Error('Debes estar autenticado para inscribirte a un evento');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session) {
    throw new Error('Sesión no válida. Por favor, inicia sesión nuevamente');
  }

  const userId = session.userId;
  const userName = session.user.name;
  const userEmail = session.user.email;

  let resultStatus: 'registered' | 'waitlisted';
  let resultId: string;

  const result = await prisma.$transaction(
    async (tx) => {
      // Bloquear el evento para serializar operaciones concurrentes
      const events = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Event" WHERE id = ${eventId} AND "deletedAt" IS NULL FOR UPDATE
      `;

      if (events.length === 0) {
        throw new Error('Evento no encontrado');
      }

      const event = await tx.event.findUnique({ where: { id: eventId } });
      if (!event) throw new Error('Evento no encontrado');

      // Verificar si ya tiene una inscripción activa
      const existingRegistration = await tx.eventRegistration.findFirst({
        where: { eventId, userId },
      });

      if (existingRegistration && existingRegistration.cancelledAt === null) {
        throw new Error('Ya estás registrado en este evento');
      }

      // Verificar si ya está en la lista de espera
      const existingWaitlist = await tx.waitlistEntry.findFirst({
        where: { eventId, userId },
      });

      if (existingWaitlist) {
        throw new Error('Ya estás en la lista de espera de este evento');
      }

      // Verificar cupo disponible
      const currentCount =
        event.capacity !== null
          ? await tx.eventRegistration.count({ where: { eventId, cancelledAt: null } })
          : 0;

      const capacityAvailable = event.capacity === null || currentCount < event.capacity;

      if (capacityAvailable) {
        // Inscribir directamente
        let registrationId: string;
        if (existingRegistration && existingRegistration.cancelledAt !== null) {
          // Reactivar inscripción cancelada
          await tx.eventRegistration.update({
            where: { id: existingRegistration.id },
            data: { cancelledAt: null },
          });
          registrationId = existingRegistration.id;
        } else {
          const newRegistration = await tx.eventRegistration.create({
            data: { eventId, userId },
          });
          registrationId = newRegistration.id;
        }
        return { status: 'registered' as const, id: registrationId, eventName: event.name };
      } else {
        // Agregar a la lista de espera
        const newEntry = await tx.waitlistEntry.create({
          data: { eventId, userId },
        });
        return { status: 'waitlisted' as const, id: newEntry.id, eventName: event.name };
      }
    },
    { timeout: 10000 },
  );

  resultStatus = result.status;
  resultId = result.id;

  // Notificar a los admins (fuera de la transacción)
  if (resultStatus === 'registered') {
    await notifyAdmins({
      type: 'event_registration_created',
      title: 'Nueva inscripción a evento',
      message: `${userName} se ha inscrito al evento "${result.eventName}"`,
      metadata: {
        eventId,
        eventName: result.eventName,
        registrationId: resultId,
        userName,
        userEmail,
      },
    });
  } else {
    await notifyAdmins({
      type: 'event_waitlist_joined',
      title: 'Nueva entrada en lista de espera',
      message: `${userName} se ha unido a la lista de espera del evento "${result.eventName}"`,
      metadata: {
        eventId,
        eventName: result.eventName,
        waitlistEntryId: resultId,
        userName,
        userEmail,
      },
    });
  }

  revalidatePath(`/eventos/${eventId}`);

  if (options?.skipRedirect) {
    return {
      success: true,
      registrationId: resultStatus === 'registered' ? resultId : undefined,
      status: resultStatus,
    };
  }

  redirect(
    `/eventos/${eventId}?${resultStatus === 'registered' ? 'registered=true' : 'waitlisted=true'}`,
  );
};
