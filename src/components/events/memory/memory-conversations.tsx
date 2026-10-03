'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Conversation } from '@/data/whatsapp-conversations';
import type { LinkedUser } from '@/lib/identity-links';
import { ConversationDialog } from '@/components/conversations/conversation-dialog';
import { ConversationRow } from '@/components/conversations/conversation-row';
import { ProfileLinksContext } from '@/components/conversations/participant-chip';
import { RuledGrid } from '@/components/ui/ruled-grid';

/**
 * The conversations summarized from the event, readable in place: each opens the same reader as
 * /conversaciones, and `@name` narrows the list to that person's conversations.
 */
export function MemoryConversations({
  conversations,
  profiles,
}: {
  conversations: Conversation[];
  profiles: Record<string, LinkedUser>;
}) {
  const [participant, setParticipant] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = participant
    ? conversations.filter((c) => c.participants.includes(participant))
    : conversations;

  const toggleParticipant = (name: string) => {
    setOpenIndex(null);
    setParticipant((current) => (current === name ? null : name));
  };

  return (
    <ProfileLinksContext.Provider value={profiles}>
      {participant && (
        <button
          type="button"
          onClick={() => setParticipant(null)}
          className="mb-2 flex h-7 items-center gap-1.5 rounded-sm border border-pcnGreen-600 bg-pcnGreen/10 px-2 font-mono text-xs text-pcnGreen"
        >
          --author=&quot;{participant}&quot;
          <X className="size-3.5" />
          <span className="sr-only">Quitar filtro de persona</span>
        </button>
      )}

      <RuledGrid className="grid-cols-1 lg:grid-cols-2">
        {filtered.map((c, i) => (
          <ConversationRow
            key={`${c.date}-${c.title}`}
            conversation={c}
            query=""
            activeParticipant={participant}
            onParticipantClick={toggleParticipant}
            onOpen={() => setOpenIndex(i)}
          />
        ))}
      </RuledGrid>

      <ConversationDialog
        conversations={filtered}
        index={openIndex}
        query=""
        activeParticipant={participant}
        onNavigate={setOpenIndex}
        onClose={() => setOpenIndex(null)}
        onParticipantClick={toggleParticipant}
      />
    </ProfileLinksContext.Provider>
  );
}
