'use server';

import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { notifyAdmins } from '@/actions/notifications/notify-admins';

type RegistrationResult =
  | {
      success: true;
      status: 'registered';
      registrationId: string;
    }
  | {
      success: true;
      status: 'waitlisted';
      waitlistId: string;
      position: number;
    };

export const registerEvent = async (
  eventId: string,
  options?: { skipRedirect?: boolean },
): Promise<RegistrationResult> => {
  // Requerir autenticación - solo usuarios autenticados pueden inscribirse
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

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const event = await tx.event.findFirst({
          where: {
            id: eventId,
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
            capacity: true,
          },
        });

        if (!event) {
          throw new Error('Evento no encontrado');
        }

        const [existingRegistration, existingWaitlist] = await Promise.all([
          tx.eventRegistration.findFirst({
            where: {
              eventId,
              userId,
            },
          }),
          tx.eventWaitlistEntry.findFirst({
            where: {
              eventId,
              userId,
            },
          }),
        ]);

        if (existingRegistration && existingRegistration.cancelledAt === null) {
          throw new Error('Ya estás registrado en este evento');
        }

        const currentRegistrations = await tx.eventRegistration.count({
          where: {
            eventId,
            cancelledAt: null,
          },
        });

        const hasCapacity = event.capacity === null || currentRegistrations < event.capacity;

        if (hasCapacity) {
          let registrationId: string;
          if (existingRegistration) {
            const registration = await tx.eventRegistration.update({
              where: { id: existingRegistration.id },
              data: { cancelledAt: null },
              select: { id: true },
            });
            registrationId = registration.id;
          } else {
            const registration = await tx.eventRegistration.create({
              data: {
                eventId,
                userId,
              },
              select: { id: true },
            });
            registrationId = registration.id;
          }

          if (existingWaitlist && existingWaitlist.cancelledAt === null && !existingWaitlist.promotedAt) {
            await tx.eventWaitlistEntry.update({
              where: { id: existingWaitlist.id },
              data: {
                cancelledAt: new Date(),
              },
            });
          }

          return {
            eventName: event.name,
            result: {
              success: true,
              status: 'registered',
              registrationId,
            } as RegistrationResult,
          };
        }

        if (existingWaitlist && existingWaitlist.cancelledAt === null && !existingWaitlist.promotedAt) {
          throw new Error('Ya estás en la lista de espera de este evento');
        }

        let waitlistId: string;
        let waitlistCreatedAt: Date;
        if (existingWaitlist) {
          const reactivatedWaitlist = await tx.eventWaitlistEntry.update({
            where: { id: existingWaitlist.id },
            data: {
              cancelledAt: null,
              promotedAt: null,
              createdAt: new Date(),
            },
            select: {
              id: true,
              createdAt: true,
            },
          });
          waitlistId = reactivatedWaitlist.id;
          waitlistCreatedAt = reactivatedWaitlist.createdAt;
        } else {
          const createdWaitlist = await tx.eventWaitlistEntry.create({
            data: {
              eventId,
              userId,
            },
            select: {
              id: true,
              createdAt: true,
            },
          });
          waitlistId = createdWaitlist.id;
          waitlistCreatedAt = createdWaitlist.createdAt;
        }

        const position = await tx.eventWaitlistEntry.count({
          where: {
            eventId,
            cancelledAt: null,
            promotedAt: null,
            createdAt: {
              lte: waitlistCreatedAt,
            },
          },
        });

        return {
          eventName: event.name,
          result: {
            success: true,
            status: 'waitlisted',
            waitlistId,
            position,
          } as RegistrationResult,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    if (result.result.status === 'registered') {
      await notifyAdmins({
        type: 'event_registration_created',
        title: 'Nueva inscripción a evento',
        message: `${userName} se ha inscrito al evento "${result.eventName}"`,
        metadata: {
          eventId,
          eventName: result.eventName,
          registrationId: result.result.registrationId,
          userName,
          userEmail,
        },
      });
    } else {
      await notifyAdmins({
        type: 'event_waitlist_joined',
        title: 'Nueva inscripción fuera de cupo',
        message: `${userName} se sumó a la lista de espera del evento "${result.eventName}"`,
        metadata: {
          eventId,
          eventName: result.eventName,
          waitlistId: result.result.waitlistId,
          waitlistPosition: result.result.position,
          userName,
          userEmail,
        },
      });
    }

    revalidatePath(`/eventos/${eventId}`);

    if (options?.skipRedirect) {
      return result.result;
    }

    if (result.result.status === 'waitlisted') {
      redirect(`/eventos/${eventId}?waitlisted=true`);
    }

    redirect(`/eventos/${eventId}?registered=true`);
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error('Ya estás inscripto para este evento o en su lista de espera');
    }
    if (error.code === 'P2034') {
      throw new Error('Se detectó mucha actividad en simultáneo. Intentá nuevamente.');
    }
    throw error;
  }
};
