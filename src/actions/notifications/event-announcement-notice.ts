// Server-only helper for other server actions. Not a server action itself, so nobody can call it
// from the browser to notify other users.

import { EventNoticeEmail } from '@/components/events/event-notice-email';
import prisma from '@/lib/prisma';
import { emailUsers } from './email-users';
import { excerpt } from './excerpt';
import { notifyUsers } from './notify-users';

/**
 * Tells everyone signed up for an event about a new announcement on it, in the app and by email,
 * except whoever published it. Never throws. Returns how many people it reached.
 */
export const notifyEventAnnouncement = async (
  event: { id: string; name: string },
  announcement: { id: string; title: string; content: string },
  authorId: string,
) => {
  try {
    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: event.id, cancelledAt: null, userId: { not: authorId } },
      select: { user: { select: { id: true, name: true, email: true } } },
    });
    const users = registrations.map((registration) => registration.user);
    if (users.length === 0) return 0;

    await notifyUsers(
      users.map((user) => user.id),
      {
        type: 'event_announcement',
        title: `Nuevo anuncio de ${event.name}`,
        message: `${announcement.title}: ${excerpt(announcement.content)}`,
        href: `/eventos/${event.id}`,
        metadata: { eventId: event.id, announcementId: announcement.id },
      },
      authorId,
    );
    await emailUsers(users, `${event.name}: ${announcement.title}`, (firstName) =>
      EventNoticeEmail({
        userName: firstName,
        eventName: event.name,
        eventId: event.id,
        path: 'eventos/anuncios',
        title: announcement.title,
        preview: `${event.name}: ${announcement.title}`,
        command: `pcn eventos anuncios "${announcement.title}"`,
        intro: 'Hay un nuevo anuncio en un evento al que te anotaste:',
        message: announcement.content,
      }),
    );
    return users.length;
  } catch (error) {
    console.error('Error notifying an event announcement:', error);
    return 0;
  }
};
