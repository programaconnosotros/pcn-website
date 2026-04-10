'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { notifyAdmins } from '@/actions/notifications/notify-admins';
import { sendEmail } from '@/lib/email';
import { render } from '@react-email/render';
import { WaitlistPromotionEmail } from '@/components/events/waitlist-promotion-email';

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

  // Obtener la inscripción para saber el eventId antes de la transacción
  const registration = await prisma.eventRegistration.findUnique({
    where: { id: registrationId },
    include: { user: true },
  });

  if (!registration) {
    throw new Error('Inscripción no encontrada');
  }

  const { eventId } = registration;

  type PromotedUser = { name: string; email: string };

  const result = await prisma.$transaction(
    async (tx) => {
      // Bloquear el evento para serializar operaciones concurrentes
      await tx.$queryRaw`
        SELECT id FROM "Event" WHERE id = ${eventId} FOR UPDATE
      `;

      const event = await tx.event.findUnique({ where: { id: eventId } });
      if (!event) throw new Error('Evento no encontrado');

      // Eliminar la inscripción físicamente
      await tx.eventRegistration.delete({ where: { id: registrationId } });

      // Si el evento tiene capacidad limitada y la inscripción era activa, promover al primero en la lista de espera
      let promotedUser: PromotedUser | null = null;
      if (event.capacity !== null && registration.cancelledAt === null) {
        const nextInWaitlist = await tx.waitlistEntry.findFirst({
          where: { eventId },
          orderBy: { createdAt: 'asc' },
          include: { user: true },
        });

        if (nextInWaitlist) {
          await tx.waitlistEntry.delete({
            where: { id: nextInWaitlist.id },
          });

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
