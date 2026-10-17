// Server-only helper for the talk actions. Not a server action itself.

import { notifyUsers } from '@/actions/notifications/notify-users';

/** Tells each of `userIds` that `actor` listed them as a speaker of the talk. */
export const notifySpeakers = (
  userIds: (string | null | undefined)[],
  talk: { id: string; title: string; eventId: string | null },
  actor: { id: string; name: string },
) =>
  notifyUsers(
    userIds,
    {
      type: 'talk_speaker_added',
      title: 'Te sumaron como speaker',
      message: `${actor.name} te sumó como speaker de la charla "${talk.title}".`,
      href: talk.eventId ? `/eventos/${talk.eventId}/charlas` : '/charlas',
      metadata: { talkId: talk.id, eventId: talk.eventId },
    },
    actor.id,
  );
