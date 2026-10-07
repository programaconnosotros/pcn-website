import { conversations, type Conversation } from '@/data/whatsapp-conversations';
import { conversationHref, shortHash } from '@/components/conversations/conversation-utils';
import raw from './consejos.json';

// Consejos picked out of the /conversaciones summaries: advice a member gave in the WhatsApp
// group, rewritten as a standalone consejo. Nobody published these by hand, so they live here
// next to the conversation data instead of in the Advice table (which needs a platform author):
// the member is a WhatsApp name, resolved to a platform user at render time through the identity
// links an admin manages on /vinculos, exactly like /conversaciones does.

export interface ExtractedConsejo {
  /** Stable id (`auto-<conversation hash>-<member>`), used in /consejos/<id>. */
  id: string;
  /** The member who gave the advice, as named in members.ts. */
  member: string;
  /** Topic tags, lowercase (e.g. `carrera`, `ia`, `testing`). */
  tags: string[];
  content: string;
  /** The conversation it was extracted from. */
  conversation: Pick<Conversation, 'date' | 'title'> & { hash: string; href: string };
}

type RawConsejo = {
  id: string;
  member: string;
  date: string;
  title: string;
  content: string;
  tags: string[];
};

const conversationOf = ({ date, title }: RawConsejo) =>
  conversations.find((conversation) => conversation.date === date && conversation.title === title);

export const extractedConsejos: ExtractedConsejo[] = (raw as RawConsejo[]).flatMap((entry) => {
  const conversation = conversationOf(entry);
  // A renamed conversation would orphan the consejo; the test suite catches it, prod just hides it.
  if (!conversation) return [];
  return [
    {
      id: entry.id,
      member: entry.member,
      tags: entry.tags,
      content: entry.content,
      conversation: {
        date: conversation.date,
        title: conversation.title,
        hash: shortHash(conversation),
        href: conversationHref(conversation),
      },
    },
  ];
});

export const EXTRACTED_ID_PREFIX = 'auto-';

export const findExtractedConsejo = (id: string) =>
  id.startsWith(EXTRACTED_ID_PREFIX)
    ? extractedConsejos.find((consejo) => consejo.id === id)
    : undefined;

export const rawExtractedConsejos = raw as RawConsejo[];
