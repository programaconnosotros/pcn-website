'use server';

import { z } from 'zod';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import prisma from '@/lib/prisma';
import { enforceRateLimit } from '@/lib/rate-limit';
import { isPushServiceEndpoint } from '@/lib/push-endpoints';

// What PushSubscription.toJSON() gives in the browser. The keys are base64url.
const base64url = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[A-Za-z0-9_-]+=*$/);

const endpointSchema = z
  .string()
  .max(1000)
  .refine(isPushServiceEndpoint, 'Servicio de notificaciones no reconocido');

const subscriptionSchema = z.object({
  endpoint: endpointSchema,
  keys: z.object({ p256dh: base64url, auth: base64url }),
});

const requireUserId = async () => {
  const session = await getCurrentSession();
  if (!session) throw new Error('Debes estar autenticado');
  return session.userId;
};

/** Turns on push in this browser for the signed-in member. */
export async function savePushSubscription(input: unknown) {
  await enforceRateLimit('editContent');
  const userId = await requireUserId();
  const parsed = subscriptionSchema.safeParse(input);
  if (!parsed.success) throw new Error('Suscripción inválida');
  const { endpoint, keys } = parsed.data;

  // The same browser can change hands (another member signs in on it): it's theirs now.
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { endpoint, p256dh: keys.p256dh, auth: keys.auth, userId },
    update: { p256dh: keys.p256dh, auth: keys.auth, userId },
  });
}

/** Turns push off in this browser. Only the member it belongs to can remove it. */
export async function deletePushSubscription(endpoint: unknown) {
  const userId = await requireUserId();
  const parsed = z.string().max(1000).safeParse(endpoint);
  if (!parsed.success) throw new Error('Suscripción inválida');
  await prisma.pushSubscription.deleteMany({ where: { endpoint: parsed.data, userId } });
}
