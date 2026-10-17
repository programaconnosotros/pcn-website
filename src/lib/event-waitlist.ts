import { render } from '@react-email/render';
import prisma, { type TransactionClient } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { notifyAdmins } from '@/actions/notifications/notify-admins';
import { WaitlistPromotionEmail } from '@/components/events/waitlist-promotion-email';

// Lógica de la lista de espera de eventos. Vive fuera de un archivo 'use server' a propósito:
// nada de esto debe poder invocarse desde el cliente como server action.

type Tx = TransactionClient;

export type PromotedUser = {
  registrationId: string;
  userId: string;
  userName: string;
  userEmail: string;
};

// Entradas que siguen esperando un lugar
export const activeWaitlistWhere = (eventId: string) => ({
  eventId,
  cancelledAt: null,
  promotedAt: null,
});

/**
 * Bloquea la fila del evento hasta que termine la transacción. Inscripciones, bajas y
 * promociones del mismo evento quedan en fila: así dos personas no pueden quedarse con el
 * último lugar ni una baja promover dos veces.
 */
export const lockEvent = async (tx: Tx, eventId: string) => {
  const rows = await tx.$queryRaw<{ id: string }[]>`
    SELECT id FROM "Event" WHERE id = ${eventId} AND "deletedAt" IS NULL FOR UPDATE
  `;
  if (rows.length === 0) return null;

  return tx.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      name: true,
      date: true,
      endDate: true,
      capacity: true,
      markedAsFull: true,
      externalRegistrationUrl: true,
    },
  });
};

type LockedEvent = NonNullable<Awaited<ReturnType<typeof lockEvent>>>;

/**
 * Le da los lugares libres a la gente en espera, en orden de llegada. No promueve si el evento
 * está marcado como lleno a mano, si la inscripción es externa o si el evento ya terminó.
 */
export const promoteFromWaitlist = async (tx: Tx, event: LockedEvent) => {
  const promoted: PromotedUser[] = [];

  const hasEnded = (event.endDate ?? event.date) < new Date();
  if (event.markedAsFull || event.externalRegistrationUrl || hasEnded) return promoted;

  for (;;) {
    if (event.capacity !== null) {
      const active = await tx.eventRegistration.count({
        where: { eventId: event.id, cancelledAt: null },
      });
      if (active >= event.capacity) break;
    }

    const next = await tx.eventWaitlistEntry.findFirst({
      where: activeWaitlistWhere(event.id),
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      include: { user: { select: { name: true, email: true } } },
    });
    if (!next) break;

    const existing = await tx.eventRegistration.findFirst({
      where: { eventId: event.id, userId: next.userId },
    });

    // Ya tenía lugar por otro camino: su entrada en espera sobra, seguir con la siguiente
    if (existing && existing.cancelledAt === null) {
      await tx.eventWaitlistEntry.update({
        where: { id: next.id },
        data: { cancelledAt: new Date() },
      });
      continue;
    }

    const registration = existing
      ? await tx.eventRegistration.update({
          where: { id: existing.id },
          data: { cancelledAt: null },
        })
      : await tx.eventRegistration.create({
          data: { eventId: event.id, userId: next.userId },
        });

    await tx.eventWaitlistEntry.update({
      where: { id: next.id },
      data: { promotedAt: new Date() },
    });

    promoted.push({
      registrationId: registration.id,
      userId: next.userId,
      userName: next.user.name,
      userEmail: next.user.email,
    });
  }

  return promoted;
};

/** Posición (empezando en 1) del usuario en la lista de espera, o null si no está esperando. */
export const getWaitlistPosition = async (eventId: string, userId: string) => {
  const entry = await prisma.eventWaitlistEntry.findFirst({
    where: { ...activeWaitlistWhere(eventId), userId },
    select: { createdAt: true },
  });
  if (!entry) return null;

  const ahead = await prisma.eventWaitlistEntry.count({
    where: { ...activeWaitlistWhere(eventId), createdAt: { lt: entry.createdAt } },
  });
  return ahead + 1;
};

const formatEventDate = (date: Date) =>
  new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(date);

/**
 * Avisa a quienes consiguieron lugar (por email) y a los admins. Corre fuera de la transacción:
 * un email que falla no deshace la promoción.
 */
export const notifyPromotions = async (
  event: { id: string; name: string; date: Date },
  promoted: PromotedUser[],
) => {
  for (const user of promoted) {
    await notifyAdmins({
      type: 'event_waitlist_promoted',
      title: 'Promoción automática desde lista de espera',
      message: `${user.userName} obtuvo un lugar en "${event.name}" desde la lista de espera`,
      metadata: {
        eventId: event.id,
        eventName: event.name,
        registrationId: user.registrationId,
        userId: user.userId,
        userName: user.userName,
        userEmail: user.userEmail,
      },
    });

    try {
      const html = await render(
        WaitlistPromotionEmail({
          userName: user.userName,
          eventName: event.name,
          eventDate: formatEventDate(event.date),
          eventId: event.id,
        }),
      );
      await sendEmail({
        to: user.userEmail,
        subject: `Conseguiste un lugar en ${event.name} - programaConNosotros`,
        html,
      });
    } catch {
      // sendEmail ya registra el detalle en el log del servidor
      console.error('No se pudo enviar el email de promoción desde la lista de espera');
    }
  }
};

/**
 * Promueve a la gente en espera si hay lugar. Para después de cambios que pueden liberar lugares
 * sin pasar por una baja (por ejemplo, editar el cupo del evento).
 */
export const fillFromWaitlist = async (eventId: string) => {
  const result = await prisma.$transaction(async (tx) => {
    const event = await lockEvent(tx, eventId);
    if (!event) return null;
    return { event, promoted: await promoteFromWaitlist(tx, event) };
  });

  if (result && result.promoted.length > 0) {
    await notifyPromotions(result.event, result.promoted);
  }
  return result?.promoted ?? [];
};
