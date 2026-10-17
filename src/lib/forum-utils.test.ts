import { nestComments, timeAgo } from './forum-utils';

const comment = (id: string, parentCommentId: string | null) =>
  ({ id, parentCommentId, content: id }) as Parameters<typeof nestComments>[0][number];

describe('nestComments', () => {
  it('nests replies under their parents, keeping the order', () => {
    const tree = nestComments([
      comment('a', null),
      comment('b', 'a'),
      comment('c', null),
      comment('d', 'b'),
      comment('e', 'a'),
      comment('orphan', 'gone'),
    ]);
    expect(tree.map((n) => n.id)).toEqual(['a', 'c', 'orphan']);
    expect(tree[0].replies.map((n) => n.id)).toEqual(['b', 'e']);
    expect(tree[0].replies[0].replies.map((n) => n.id)).toEqual(['d']);
  });
});

describe('timeAgo', () => {
  const now = new Date('2026-10-07T12:00:00Z');
  it('says how long ago, in Spanish', () => {
    expect(timeAgo(new Date('2026-10-07T11:59:40Z'), now)).toBe('recién');
    expect(timeAgo(new Date('2026-10-07T11:55:00Z'), now)).toBe('hace 5 minutos');
    expect(timeAgo(new Date('2026-10-07T09:00:00Z'), now)).toBe('hace 3 horas');
    expect(timeAgo('2026-10-06T12:00:00Z', now)).toBe('ayer');
    expect(timeAgo(new Date('2026-09-23T12:00:00Z'), now)).toBe('hace 2 semanas');
    expect(timeAgo(new Date('2025-10-07T12:00:00Z'), now)).toBe('el año pasado');
  });
});
