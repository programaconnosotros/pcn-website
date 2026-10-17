import webpush from 'web-push';
import prisma from '@/lib/prisma';
import { isPushServiceEndpoint } from '@/lib/push-endpoints';

/**
 * Web Push: notifications that reach a member's phone or computer with the site closed. Each
 * browser where they turned them on is a PushSubscription; public/sw.js shows what arrives.
 *
 * Needs a VAPID key pair (`pnpm dlx web-push generate-vapid-keys`): VAPID_PUBLIC_KEY,
 * VAPID_PRIVATE_KEY and VAPID_SUBJECT (a mailto: or https: URL the push services can contact).
 * Without them push is off: the toggle doesn't show and nothing is sent.
 */

export interface PushPayload {
  title: string;
  body: string;
  /** Same-site path the notification opens. */
  url: string;
  /** Notifications with the same tag replace each other instead of piling up. */
  tag?: string;
}

/** The public key the browser subscribes with, or null when push isn't configured. */
export const vapidPublicKey = () =>
  process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT
    ? process.env.VAPID_PUBLIC_KEY
    : null;

// A notification about an event or a reply is stale after a day: the push service drops it if
// the device stays offline longer than that.
const TTL_SECONDS = 24 * 60 * 60;
// Push services answer 404 or 410 for a subscription that no longer exists (the member revoked
// the permission, cleared the site's data or uninstalled the app).
const GONE = new Set([404, 410]);
// Push services rate-limit each sender: a notification to every member goes out in batches.
const BATCH = 100;

/** Sends `payload` to every browser of `userIds`. Never throws, like notifyUsers. */
export const sendPush = async (userIds: string[], payload: PushPayload) => {
  const publicKey = vapidPublicKey();
  if (!publicKey || userIds.length === 0) return;

  try {
    const subscriptions = await prisma.pushSubscription
      .findMany({
        where: { userId: { in: userIds } },
        select: { id: true, endpoint: true, p256dh: true, auth: true },
      })
      // Saved through savePushSubscription, which already checks it; never POST anywhere else.
      .then((rows) => rows.filter((row) => isPushServiceEndpoint(row.endpoint)));
    const body = JSON.stringify(payload);
    const gone: string[] = [];

    for (let start = 0; start < subscriptions.length; start += BATCH) {
      await Promise.all(
        subscriptions.slice(start, start + BATCH).map(async ({ id, endpoint, p256dh, auth }) => {
          try {
            await webpush.sendNotification({ endpoint, keys: { p256dh, auth } }, body, {
              TTL: TTL_SECONDS,
              vapidDetails: {
                subject: process.env.VAPID_SUBJECT!,
                publicKey,
                privateKey: process.env.VAPID_PRIVATE_KEY!,
              },
            });
          } catch (error) {
            const status = (error as { statusCode?: number }).statusCode;
            if (status && GONE.has(status)) gone.push(id);
            else console.error(`web push: send failed (${status ?? 'no status'})`, error);
          }
        }),
      );
    }

    if (gone.length > 0) {
      await prisma.pushSubscription.deleteMany({ where: { id: { in: gone } } });
    }
  } catch (error) {
    console.error('web push: could not send', error);
  }
};
