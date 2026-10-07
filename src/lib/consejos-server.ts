import { findExtractedConsejo } from '@/data/consejos-extraidos';
import { getIdentityMap } from '@/lib/identity-links';
import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';
import { listHiddenConsejoIds } from '@/lib/hidden-consejos';
import { fromAdvice, fromExtracted, type ExtractedActivity } from '@/lib/consejos';

const authorSelect = { select: { id: true, name: true, image: true } } as const;

const ADVICE_MODELS = ['Advice', 'User', 'Like', 'Comment'] as const;

/** Every published consejo, newest first, with its likes and comment count. Cached. */
export const listAdvice = cached(
  'advice',
  () =>
    prisma.advice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: authorSelect,
        likes: { select: { userId: true } },
        _count: { select: { comments: true } },
      },
    }),
  { models: ADVICE_MODELS },
);

/**
 * Likes and comment counts of the consejos extracted from the conversations, by `auto-` id.
 * Cached; the list and the detail both read it.
 */
export const listExtractedActivity = cached(
  'extracted-consejo-activity',
  async () => {
    const [likes, comments] = await Promise.all([
      prisma.like.findMany({
        where: { extractedId: { not: null } },
        select: { userId: true, extractedId: true },
      }),
      prisma.comment.groupBy({
        by: ['extractedId'],
        where: { extractedId: { not: null } },
        _count: { _all: true },
      }),
    ]);
    const activity: Record<string, ExtractedActivity> = {};
    const of = (id: string) => (activity[id] ??= { likes: [], commentCount: 0 });
    for (const { userId, extractedId } of likes) of(extractedId!).likes.push({ userId });
    for (const { extractedId, _count } of comments) of(extractedId!).commentCount = _count._all;
    return activity;
  },
  { models: ['Like', 'Comment'] },
);

const commentsInclude = {
  where: { parentCommentId: null },
  orderBy: { createdAt: 'desc' },
  include: { author: authorSelect, replies: { include: { author: authorSelect } } },
} as const;

const findExtractedComments = cached(
  'extracted-consejo-comments',
  (extractedId: string) =>
    prisma.comment.findMany({ ...commentsInclude, where: { extractedId, parentCommentId: null } }),
  { models: ['Comment', 'User'] },
);

const findAdvice = cached(
  'advice',
  (id: string) =>
    prisma.advice.findUnique({
      where: { id },
      include: {
        author: authorSelect,
        likes: { select: { userId: true } },
        _count: { select: { comments: true } },
        comments: commentsInclude,
      },
    }),
  { models: ADVICE_MODELS },
);

/**
 * One consejo with its comments, published or extracted from a conversation (the `auto-` ids).
 * Cached, so metadata, the page and the modal share one lookup.
 */
export const getConsejoDetail = async (id: string) => {
  const extracted = findExtractedConsejo(id);
  if (extracted) {
    const [profiles, activity, comments, hidden] = await Promise.all([
      getIdentityMap('whatsapp'),
      listExtractedActivity(),
      findExtractedComments(id),
      listHiddenConsejoIds(),
    ]);
    if (hidden.includes(id)) return null;
    return { consejo: fromExtracted(extracted, profiles, activity[id]), comments };
  }

  const advice = await findAdvice(id);
  if (!advice) return null;
  return { consejo: fromAdvice(advice), comments: advice.comments };
};

export type ConsejoDetail = NonNullable<Awaited<ReturnType<typeof getConsejoDetail>>>;
