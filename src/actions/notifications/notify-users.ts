// Server-only helper for other server actions. Not a server action itself, so nobody can call it
// from the browser to notify other users.

import prisma from '@/lib/prisma';

type UserNotification = {
  type: string;
  title: string;
  message: string;
  /** Where the notification takes you: the page shows a link to it. */
  href: string;
  metadata?: Record<string, unknown>;
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

  const { href, metadata, ...notification } = data;
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
};

/** Notifies every active user but `actorId`, e.g. about a new event. Never throws either. */
export const notifyEveryone = async (data: UserNotification, actorId?: string) => {
  try {
    const users = await prisma.user.findMany({
      where: { suspendedAt: null },
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
