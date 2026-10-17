import type { ForumCommentRow } from '@/lib/forum';

// Pure helpers for /foro, safe to import from client components.

export type ForumCommentNode = ForumCommentRow & { replies: ForumCommentNode[] };

/** Nest the flat replies under their parents, keeping each level oldest first. */
export const nestComments = (comments: ForumCommentRow[]): ForumCommentNode[] => {
  const nodes = new Map(comments.map((c) => [c.id, { ...c, replies: [] as ForumCommentNode[] }]));
  const roots: ForumCommentNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentCommentId ? nodes.get(node.parentCommentId) : undefined;
    (parent ? parent.replies : roots).push(node);
  }
  return roots;
};

const relative = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 86_400],
  ['month', 30 * 86_400],
  ['week', 7 * 86_400],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

/** `hace 3 horas`, `ayer`, `hace 2 semanas`; `recién` under a minute. */
export const timeAgo = (date: Date | string, now = new Date()) => {
  const seconds = Math.round((new Date(date).getTime() - now.getTime()) / 1000);
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return 'recién';
};
