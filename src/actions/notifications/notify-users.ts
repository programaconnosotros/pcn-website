// Server-only helper for other server actions. Not a server action itself, so nobody can call it
// from the browser to notify other users.

import prisma from '@/lib/prisma';
import { ACTIVE_USER } from '@/lib/active-user';
import { sendPush } from '@/lib/web-push';

type UserNotification = {
  type: string;
  title: string;
  message: string;
  /** Where the notification takes you: the page shows a link to it. */
  href: string;
  metadata?: Record<string, unknown>;
  /**
   * Also sends it as a push notification to the devices where they turned push on. Only for what
   * is worth interrupting someone for: new events, changes to an event they're going to, replies
   * to them in the forum, new job offers. Not for likes.
   */
  push?: boolean;
};

/**
 * Notifies each of `userIds` once, except `actorId` (nobody gets told about what they did
 * themselves). Never throws: a notification that couldn't be saved shouldn't undo the like,
 * comment or tag that caused it.
 */
export const notifyUsers = async (
  userIds: (string | null | undefined)[],
  data: UserNotification,
  actorId?: string,
) => {
  const recipients = [
    ...new Set(userIds.filter((id): id is string => Boolean(id) && id !== actorId)),
  ];
  if (recipients.length === 0) return;

  const { href, metadata, push, ...notification } = data;
  try {
    await prisma.notification.createMany({
      data: recipients.map((userId) => ({
        ...notification,
        userId,
        metadata: JSON.stringify({ ...metadata, href }),
      })),
    });
  } catch (error) {
    console.error(`Error notifying users (${data.type}):`, error);
  }

  if (push) {
    await sendPush(recipients, {
      title: notification.title,
      body: notification.message,
      url: href,
      tag: `${notification.type}:${href}`,
    });
  }
};

/** Notifies every active user but `actorId`, e.g. about a new event. Never throws either. */
export const notifyEveryone = async (data: UserNotification, actorId?: string) => {
  try {
    const users = await prisma.user.findMany({
      where: ACTIVE_USER,
      select: { id: true },
    });
    await notifyUsers(
      users.map((user) => user.id),
      data,
      actorId,
    );
  } catch (error) {
    console.error(`Error notifying everyone (${data.type}):`, error);
  }
};
