import { conversations, type Conversation } from '@/data/whatsapp-conversations';
import { conversationHref, shortHash } from '@/components/conversations/conversation-utils';
import raw from './testimonios.json';

// Testimonials picked out of the /conversaciones summaries: moments where a member said what the
// community meant or did for them. They're paraphrased in third person (never quoted, since the
// summaries aren't verbatim) and resolved to a platform user at render time through the identity
// links on /vinculos, like the extracted consejos.

export interface ExtractedTestimonial {
  /** Stable id (`auto-<conversation hash>-<member>`). */
  id: string;
  /** The member, as named in members.ts. */
  member: string;
  content: string;
  conversation: Pick<Conversation, 'date' | 'title'> & { hash: string; href: string };
}

export type RawTestimonial = {
  id: string;
  member: string;
  date: string;
  title: string;
  content: string;
};

export const rawExtractedTestimonials = raw as RawTestimonial[];

export const extractedTestimonials: ExtractedTestimonial[] = rawExtractedTestimonials
  .flatMap((entry) => {
    const conversation = conversations.find(
      ({ date, title }) => date === entry.date && title === entry.title,
    );
    // A renamed conversation would orphan it; the test suite catches it, prod just hides it.
    if (!conversation) return [];
    return [
      {
        id: entry.id,
        member: entry.member,
        content: entry.content,
        conversation: {
          date: conversation.date,
          title: conversation.title,
          hash: shortHash(conversation),
          href: conversationHref(conversation),
        },
      },
    ];
  })
  .sort((a, b) => b.conversation.date.localeCompare(a.conversation.date));
