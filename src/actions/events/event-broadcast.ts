'use server';

import { render } from '@react-email/render';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { EventBroadcastEmail } from '@/components/events/event-broadcast-email';
import { sendEmail } from '@/lib/email';
import { requireEventManager } from '@/lib/event-access';
import { activeWaitlistWhere } from '@/lib/event-waitlist';
import { BROADCAST_AUDIENCES, type BroadcastAudience } from '@/lib/event-broadcast';
import prisma from '@/lib/prisma';
import { enforceRateLimit } from '@/lib/rate-limit';

const broadcastSchema = z.object({
  audience: z.enum(BROADCAST_AUDIENCES),
  subject: z
    .string()
    .trim()
    .min(3, { message: 'El asunto tiene que tener al menos 3 caracteres' })
    .max(120, { message: 'El asunto puede tener 120 caracteres como máximo' }),
  message: z
    .string()
    .trim()
    .min(10, { message: 'Escribí un mensaje de al menos 10 caracteres' })
    .max(5000, { message: 'El mensaje puede tener 5000 caracteres como máximo' }),
});

/** How many mails go out at a time, so a big event doesn't hit the provider all at once. */
const BATCH = 10;

/** Who gets a mail for each audience: name and email, once each. */
const recipientsFor = async (eventId: string, audience: BroadcastAudience) => {
  const [registrations, waitlist] = await Promise.all([
    audience === 'lista-de-espera'
      ? []
      : prisma.eventRegistration.findMany({
          where: { eventId, cancelledAt: null },
          select: { user: { select: { name: true, email: true } } },
        }),
    audience === 'confirmados'
      ? []
      : prisma.eventWaitlistEntry.findMany({
          where: activeWaitlistWhere(eventId),
          select: { user: { select: { name: true, email: true } } },
        }),
  ]);
  const byEmail = new Map<string, { name: string; email: string }>();
  for (const { user } of [...registrations, ...waitlist]) {
    const key = user.email.toLowerCase();
    if (!byEmail.has(key)) byEmail.set(key, user);
  }
  return [...byEmail.values()];
};

/** How many people each audience reaches, for the form. Only who manages the event. */
export async function getBroadcastAudienceCounts(eventId: string) {
  await requireEventManager(eventId);
  const [confirmados, listaDeEspera, todos] = await Promise.all(
    BROADCAST_AUDIENCES.map(async (audience) => (await recipientsFor(eventId, audience)).length),
  );
  return { confirmados, 'lista-de-espera': listaDeEspera, todos } satisfies Record<
    BroadcastAudience,
    number
  >;
}

/**
 * Mails a message to the people signed up for an event: the confirmed ones, the waitlist or
 * both. Only admins and the event's organizers, a few times an hour. Keeps a record of it.
 */
export async function sendEventBroadcast(eventId: string, input: z.input<typeof broadcastSchema>) {
  const manager = await requireEventManager(eventId);
  await enforceRateLimit('eventBroadcast');
  const parsed = broadcastSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Datos inválidos');
  const { audience, subject, message } = parsed.data;

  const event = await prisma.event.findFirst({
    where: { id: eventId, deletedAt: null },
    select: { id: true, name: true },
  });
  if (!event) throw new Error('Evento no encontrado');

  const recipients = await recipientsFor(eventId, audience);
  if (recipients.length === 0) throw new Error('No hay nadie a quien mandarle el mail');

  let failed = 0;
  for (let i = 0; i < recipients.length; i += BATCH) {
    const results = await Promise.allSettled(
      recipients.slice(i, i + BATCH).map(async (recipient) =>
        sendEmail({
          to: recipient.email,
          subject: `${event.name}: ${subject}`,
          html: await render(
            EventBroadcastEmail({
              userName: recipient.name.split(' ')[0] ?? recipient.name,
              eventName: event.name,
              eventId: event.id,
              subject,
              message,
            }),
          ),
        }),
      ),
    );
    failed += results.filter((result) => result.status === 'rejected').length;
  }

  await prisma.eventBroadcast.create({
    data: {
      eventId,
      authorId: manager.id,
      audience,
      subject,
      message,
      recipients: recipients.length,
      failed,
    },
  });
  revalidatePath(`/eventos/${eventId}/inscripciones`);

  return { sent: recipients.length - failed, failed };
}
