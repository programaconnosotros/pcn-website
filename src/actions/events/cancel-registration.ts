'use server';

import { notifyAdmins } from '@/actions/notifications/notify-admins';
import { WaitlistPromotionEmail } from '@/components/events/waitlist-promotion-email';
import { sendEmail } from '@/lib/email';
import prisma from '@/lib/prisma';
import { render } from '@react-email/render';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

type CancelRegistrationParams = {
  registrationId?: string;
  eventId: string;
};

export const cancelRegistration = async (params: CancelRegistrationParams) => {
  const { registrationId, eventId } = params;

  // Verificar autenticación antes de la transacción
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

  type PromotedUser = {
    name: string;
    email: string;
  };

  const result = await prisma.$transaction(
    async (tx) => {
      // Bloquear el evento para evitar condicion de carrera
      const events = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Event" WHERE id = ${eventId} AND "deletedAt" IS NULL FOR UPDATE
      `;

      if (events.length === 0) {
        throw new Error('Evento no encontrado');
      }

      const event = await tx.event.findUnique({ where: { id: eventId } });
      if (!event) throw new Error('Evento no encontrado');

      // Buscar la inscripción a cancelar
      let registration = null;
      if (registrationId) {
        
        registration = await tx.eventRegistration.findFirst({
          where: {
            id: registrationId,
            eventId,
            userId: session.userId,
            cancelledAt: null,
          },
          include: { user: true },
        });
      } else {
        registration = await tx.eventRegistration.findFirst({
          where: { eventId, userId: session.userId, cancelledAt: null },
          include: { user: true },
        });
      }

      if (!registration) {
        throw new Error('Inscripción no encontrada o ya cancelada');
      }

      // Cancelar la inscripción
      await tx.eventRegistration.update({
        where: { id: registration.id },
        data: { cancelledAt: new Date() },
      });

      // Si el evento tiene capacidad limitada, promover al primero en la lista de espera
      let promotedUser: PromotedUser | null = null;
      if (event.capacity !== null) {
        const nextInWaitlist = await tx.waitlistEntry.findFirst({
          where: { eventId },
          orderBy: { createdAt: 'asc' },
          include: { user: true },
        });

        if (nextInWaitlist) {
          // Eliminar la entrada de la lista de espera (el usuario fue promovido)
          await tx.waitlistEntry.delete({
            where: { id: nextInWaitlist.id },
          });

          // Crear o reactivar la inscripción del usuario promovido
          const existingRegistration = await tx.eventRegistration.findFirst({
            where: { eventId, userId: nextInWaitlist.userId },
          });

          if (existingRegistration) {
            await tx.eventRegistration.update({
              where: { id: existingRegistration.id },
              data: { cancelledAt: null },
            });
          } else {
            await tx.eventRegistration.create({
              data: { eventId, userId: nextInWaitlist.userId },
            });
          }

          promotedUser = {
            name: nextInWaitlist.user.name,
            email: nextInWaitlist.user.email,
          };
        }
      }

      return {
        registrationId: registration.id,
        userName: registration.user.name,
        userEmail: registration.user.email,
        eventName: event.name,
        eventDate: new Date(event.date).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        promotedUser,
      };
    },
    { timeout: 10000 },
  );

  // Notificaciones y emails fuera de la transacción
  await notifyAdmins({
    type: 'event_registration_cancelled',
    title: 'Inscripción cancelada',
    message: `${result.userName} ha cancelado su inscripción al evento "${result.eventName}"`,
    metadata: {
      eventId,
      eventName: result.eventName,
      registrationId: result.registrationId,
      userName: result.userName,
      userEmail: result.userEmail,
    },
  });

  if (result.promotedUser) {
    await notifyAdmins({
      type: 'event_waitlist_promoted',
      title: 'Usuario promovido desde lista de espera',
      message: `${result.promotedUser.name} fue inscrito automáticamente al evento "${result.eventName}" desde la lista de espera`,
      metadata: {
        eventId,
        eventName: result.eventName,
        userName: result.promotedUser.name,
        userEmail: result.promotedUser.email,
      },
    });

    // Enviar email al usuario promovido
    try {
      const emailHtml = await render(
        WaitlistPromotionEmail({
          userName: result.promotedUser.name,
          eventName: result.eventName,
          eventDate: result.eventDate,
          eventId,
        }),
      );
      await sendEmail({
        to: result.promotedUser.email,
        subject: `Te has inscrito al evento ${result.eventName} - Programa Con Nosotros`,
        html: emailHtml,
      });
    } catch (error) {
      console.error('Error al enviar email de promoción desde lista de espera:', error);
    }
  }

  revalidatePath(`/eventos/${eventId}`);
  return { success: true };
};
