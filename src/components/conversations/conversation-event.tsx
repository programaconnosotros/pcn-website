'use client';

import { createContext, useContext } from 'react';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import type { Conversation } from '@/data/whatsapp-conversations';

/** Event id → name, for the events that conversations happened at and that still exist. */
export const ConversationEventsContext = createContext<Record<string, string>>({});

// Links a conversation to the event it happened at. An event that no longer exists isn't in the
// context, so its conversations still show, just without the link.
export function ConversationEventLink({ conversation }: { conversation: Conversation }) {
  const name = useContext(ConversationEventsContext)[conversation.eventId ?? ''];
  if (!conversation.eventId || !name) return null;

  return (
    <Link
      href={`/eventos/${conversation.eventId}`}
      title={`Ver el evento ${name}`}
      className="relative z-10 flex min-w-0 items-center gap-1 text-pcnGreen-700 transition-colors hover:text-pcnGreen"
    >
      <CalendarDays className="size-3 shrink-0" />
      <span className="truncate">{name}</span>
    </Link>
  );
}
