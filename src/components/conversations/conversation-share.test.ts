import { conversations } from '@/data/whatsapp-conversations';
import { conversationOgImagePath, findConversation, shareDescription } from './conversation-share';
import { shortHash } from './conversation-utils';

const conversation = conversations[0];

describe('findConversation', () => {
  it('finds a conversation by its short hash', () => {
    expect(findConversation(shortHash(conversation))).toBe(conversation);
  });

  it('returns null for a missing or unknown hash', () => {
    expect(findConversation(null)).toBeNull();
    expect(findConversation('')).toBeNull();
    expect(findConversation('zzzzzzz')).toBeNull();
  });
});

describe('shareDescription', () => {
  const make = (summary: string) => ({ ...conversation, summary });

  it('keeps whole sentences up to the limit', () => {
    expect(shareDescription(make('Primera frase corta. Segunda frase que no entra.'), 30)).toBe(
      'Primera frase corta.',
    );
  });

  it('cuts a single long sentence with an ellipsis', () => {
    const description = shareDescription(make('a'.repeat(300)), 50);
    expect(description).toHaveLength(50);
    expect(description.endsWith('…')).toBe(true);
  });

  it('never exceeds the limit for real summaries', () => {
    for (const c of conversations) expect(shareDescription(c).length).toBeLessThanOrEqual(200);
  });
});

describe('conversationOgImagePath', () => {
  it('points at the conversation card, or the section card without one', () => {
    expect(conversationOgImagePath(conversation)).toBe(
      `/conversaciones/og?c=${shortHash(conversation)}`,
    );
    expect(conversationOgImagePath(null)).toBe('/conversaciones/og');
  });
});
