import type { NextRequest } from 'next/server';
import {
  CONVERSATION_PARAM,
  formatLongDate,
  shortHash,
} from '@/components/conversations/conversation-utils';
import { findConversation, shareDescription } from '@/components/conversations/conversation-share';
import { renderSectionCard } from '@/lib/og/section-cards';
import { renderTerminalCard } from '@/lib/og/terminal-card';

// A conversation's link preview, so a shared `/conversaciones?c=<hash>` shows its title and the
// start of its summary instead of the generic section card. `opengraph-image.tsx` can't read the
// query string, hence a route handler.
export function GET(request: NextRequest) {
  const conversation = findConversation(request.nextUrl.searchParams.get(CONVERSATION_PARAM));
  if (!conversation) return renderSectionCard('conversaciones');

  const voices = conversation.participants.length;
  return renderTerminalCard({
    path: 'conversaciones',
    command: `git show ${shortHash(conversation)}`,
    title: conversation.title,
    description: shareDescription(conversation),
    meta: [
      formatLongDate(conversation.date),
      ...(voices ? [`${voices} ${voices === 1 ? 'voz' : 'voces'}`] : []),
    ],
  });
}
