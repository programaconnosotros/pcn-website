import { conversations, type Conversation } from '@/data/whatsapp-conversations';
import { CONVERSATION_PARAM, shortHash, toSentences } from './conversation-utils';

/** The conversation a `?c=<hash>` link points at, if any. */
export const findConversation = (hash: string | null | undefined): Conversation | null =>
  (hash && conversations.find((conversation) => shortHash(conversation) === hash)) || null;

/**
 * The opening sentences of the summary, up to about `max` characters, for link previews:
 * WhatsApp and friends cut long descriptions mid-word, so stop at a sentence when possible.
 */
export const shareDescription = ({ summary }: Conversation, max = 200) => {
  let description = '';
  for (const sentence of toSentences(summary)) {
    const next = description ? `${description} ${sentence}` : sentence;
    if (next.length > max) break;
    description = next;
  }
  if (description) return description;
  return summary.length > max ? `${summary.slice(0, max - 1).trimEnd()}…` : summary;
};

/** The preview image for a conversation link, or the section card without one. */
export const conversationOgImagePath = (conversation: Conversation | null) =>
  conversation
    ? `/conversaciones/og?${CONVERSATION_PARAM}=${shortHash(conversation)}`
    : '/conversaciones/og';
