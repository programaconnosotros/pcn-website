import {
  EXTRACTED_ID_PREFIX,
  extractedConsejos,
  findExtractedConsejo,
  rawExtractedConsejos,
} from '@/data/consejos-extraidos';
import { conversations } from '@/data/whatsapp-conversations';
import { members } from '@/data/whatsapp-conversations/members';
import {
  DEFAULT_CONSEJO_FILTERS,
  authorKey,
  consejoTopics,
  filterConsejos,
  fromAdvise,
  fromExtracted,
  sortByNewest,
  type Consejo,
} from './consejos';

const published = (overrides: Partial<Consejo>): Consejo => ({
  id: 'a',
  content: 'Medí antes de optimizar.',
  createdAt: '2026-01-01T00:00:00.000Z',
  author: { id: 'user-1', name: 'Ana López', image: null },
  likes: [],
  commentCount: 0,
  tags: [],
  source: null,
  ...overrides,
});

describe('consejoTopics', () => {
  it('uses the tags of extracted consejos', () => {
    expect(consejoTopics({ content: 'Aprendé inglés', tags: ['carrera'] })).toEqual(['carrera']);
  });

  it('infers topics from word starts, without accents', () => {
    expect(consejoTopics({ content: 'Practicá inglés todos los días', tags: [] })).toEqual(
      expect.arrayContaining(['aprendizaje', 'ingles']),
    );
    // "ia" only as a word, not inside "experiencia".
    expect(consejoTopics({ content: 'La experiencia suma', tags: [] })).not.toContain('ia');
  });
});

describe('filterConsejos', () => {
  const a = published({ id: 'a', likes: [{ userId: 'x' }], createdAt: '2026-01-01' });
  const b = published({
    id: 'b',
    content: 'Usá rebase con cuidado',
    author: { id: null, name: 'Ariel Basabe', image: null },
    createdAt: '2026-02-01',
    tags: ['herramientas'],
    source: { title: 'Merge vs rebase', date: '2026-02-01', hash: 'abc1234', href: '/x' },
    likes: null,
  });
  const c = published({ id: 'c', commentCount: 4, createdAt: '2025-12-01' });
  const all = [a, b, c];
  const ids = (filters: Partial<typeof DEFAULT_CONSEJO_FILTERS>) =>
    filterConsejos(all, { ...DEFAULT_CONSEJO_FILTERS, ...filters }).map(({ id }) => id);

  it('lists everything newest first by default', () => {
    expect(ids({})).toEqual(['b', 'a', 'c']);
  });

  it('searches text, author and source without accents', () => {
    expect(ids({ query: 'medi' })).toEqual(['a', 'c']);
    expect(ids({ query: 'basabe' })).toEqual(['b']);
    expect(ids({ query: 'merge vs' })).toEqual(['b']);
  });

  it('filters by origin, author and topic', () => {
    expect(ids({ origin: 'auto' })).toEqual(['b']);
    expect(ids({ origin: 'manual' })).toEqual(['a', 'c']);
    expect(ids({ author: authorKey(b) })).toEqual(['b']);
    expect(ids({ topic: 'herramientas' })).toEqual(['b']);
  });

  it('sorts by likes, comments or oldest', () => {
    expect(ids({ sort: 'likes' })[0]).toBe('a');
    expect(ids({ sort: 'comentados' })[0]).toBe('c');
    expect(ids({ sort: 'antiguos' })).toEqual(['c', 'a', 'b']);
  });
});

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
