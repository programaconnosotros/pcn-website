import type { Metadata } from 'next';
import { getAdminUser } from '@/lib/admin';
import { getIdentityMap } from '@/lib/identity-links';
import { getEventNames } from '@/lib/event-index';
import { conversations } from '@/data/whatsapp-conversations';
import {
  conversationOgImagePath,
  findConversation,
  shareDescription,
} from '@/components/conversations/conversation-share';
import {
  CONVERSATION_PARAM,
  conversationHref,
} from '@/components/conversations/conversation-utils';
import { OG_SIZE } from '@/lib/og/size';
import { tabTitle } from '@/lib/tab-title';
import { ConversationsClient } from './conversations-client';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

const eventIds = [...new Set(conversations.flatMap((c) => (c.eventId ? [c.eventId] : [])))];

interface ConversationsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// A shared `?c=<hash>` link previews as that conversation (title, opening of the summary and a
// card with both) rather than as the whole section.
export async function generateMetadata({
  searchParams,
}: ConversationsPageProps): Promise<Metadata> {
  const hash = (await searchParams)[CONVERSATION_PARAM];
  const conversation = findConversation(typeof hash === 'string' ? hash : null);
  if (!conversation) return {};

  const title = `${conversation.title} | Conversaciones de programaConNosotros`;
  const description = shareDescription(conversation);
  const image = { url: conversationOgImagePath(conversation), ...OG_SIZE, alt: conversation.title };
  return {
    title: tabTitle.cat('conversaciones', conversation.title),
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${conversationHref(conversation)}`,
      type: 'article',
      siteName: 'programaConNosotros',
      images: [image],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function ConversationsPage() {
  const [profiles, admin, events] = await Promise.all([
    getIdentityMap('whatsapp'),
    getAdminUser(),
    getEventNames(eventIds),
  ]);

  return <ConversationsClient profiles={profiles} events={events} isAdmin={!!admin} />;
}
