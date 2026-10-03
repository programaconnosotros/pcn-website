import { getAdminUser } from '@/lib/admin';
import { getIdentityMap } from '@/lib/identity-links';
import prisma from '@/lib/prisma';
import { conversations } from '@/data/whatsapp-conversations';
import { ConversationsClient } from './conversations-client';

const eventIds = [...new Set(conversations.flatMap((c) => (c.eventId ? [c.eventId] : [])))];

export default async function ConversationsPage() {
  const [profiles, admin, events] = await Promise.all([
    getIdentityMap('whatsapp'),
    getAdminUser(),
    prisma.event.findMany({
      where: { id: { in: eventIds }, deletedAt: null },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <ConversationsClient
      profiles={profiles}
      events={Object.fromEntries(events.map((event) => [event.id, event.name]))}
      isAdmin={!!admin}
    />
  );
}
