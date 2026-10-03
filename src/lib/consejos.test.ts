import {
  EXTRACTED_ID_PREFIX,
  extractedConsejos,
  findExtractedConsejo,
  rawExtractedConsejos,
} from '@/data/consejos-extraidos';
import { conversations } from '@/data/whatsapp-conversations';
import { members } from '@/data/whatsapp-conversations/members';
import { fromAdvise, fromExtracted, sortByNewest } from './consejos';

describe('extracted consejos data', () => {
  it('points every consejo at an existing conversation', () => {
    expect(extractedConsejos).toHaveLength(rawExtractedConsejos.length);
  });

  it('attributes every consejo to a member who took part in that conversation', () => {
    const names = new Set(members.map(({ name }) => name));
    for (const consejo of rawExtractedConsejos) {
      expect(names.has(consejo.member)).toBe(true);
      const conversation = conversations.find(
        ({ date, title }) => date === consejo.date && title === consejo.title,
      );
      expect(conversation?.participants).toContain(consejo.member);
    }
  });

  it('uses unique, prefixed ids', () => {
    const ids = rawExtractedConsejos.map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id.startsWith(EXTRACTED_ID_PREFIX)).toBe(true);
  });

  it('finds extracted consejos by id only', () => {
    const [first] = extractedConsejos;
    expect(findExtractedConsejo(first.id)).toBe(first);
    expect(findExtractedConsejo('cmabc123')).toBeUndefined();
  });
});

describe('fromExtracted', () => {
  const [consejo] = extractedConsejos;

  it('keeps the WhatsApp name when nobody linked a profile', () => {
    const result = fromExtracted(consejo, {});
    expect(result.author).toEqual({ id: null, name: consejo.member, image: null });
    expect(result.likes).toBeNull();
    expect(result.source).toMatchObject({ href: consejo.conversation.href });
    expect(result.source?.href).toMatch(/^\/conversaciones\?c=[0-9a-f]{7}$/);
  });

  it('attributes it to the linked platform user', () => {
    const user = { id: 'user-1', name: 'Alguien', image: null };
    expect(fromExtracted(consejo, { [consejo.member]: user }).author).toEqual(user);
  });
});

describe('fromAdvise', () => {
  it('maps a published consejo', () => {
    const createdAt = new Date('2026-01-02T03:04:05.000Z');
    const result = fromAdvise({
      id: 'a1',
      content: 'Medí antes de optimizar.',
      authorId: 'user-1',
      createdAt,
      updatedAt: createdAt,
      author: { id: 'user-1', name: 'Alguien', image: null },
      likes: [{ userId: 'user-2' }],
      _count: { comments: 3 },
    });
    expect(result).toMatchObject({
      id: 'a1',
      createdAt: createdAt.toISOString(),
      likes: [{ userId: 'user-2' }],
      commentCount: 3,
      source: null,
    });
  });
});

describe('sortByNewest', () => {
  it('orders by date, newest first', () => {
    const at = (createdAt: string) => ({ ...fromExtracted(extractedConsejos[0], {}), createdAt });
    expect(
      sortByNewest([at('2025-01-01'), at('2026-01-01'), at('2025-06-01')]).map((c) => c.createdAt),
    ).toEqual(['2026-01-01', '2025-06-01', '2025-01-01']);
  });
});
