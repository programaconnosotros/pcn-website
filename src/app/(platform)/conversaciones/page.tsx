import { getAdminUser } from '@/lib/admin';
import { getIdentityMap } from '@/lib/identity-links';
import { getEventNames } from '@/lib/event-index';
import { conversations } from '@/data/whatsapp-conversations';
import { ConversationsClient } from './conversations-client';

const eventIds = [...new Set(conversations.flatMap((c) => (c.eventId ? [c.eventId] : [])))];

export default async function ConversationsPage() {
  const [profiles, admin, events] = await Promise.all([
    getIdentityMap('whatsapp'),
    getAdminUser(),
    getEventNames(eventIds),
  ]);

  return <ConversationsClient profiles={profiles} events={events} isAdmin={!!admin} />;
}
