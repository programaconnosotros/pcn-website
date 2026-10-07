import { findExtractedConsejo } from '@/data/consejos-extraidos';
import { getIdentityMap } from '@/lib/identity-links';
import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';
import { fromAdvice, fromExtracted } from '@/lib/consejos';

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

const findAdvice = cached(
  'advice',
  (id: string) =>
    prisma.advice.findUnique({
      where: { id },
      include: {
        author: authorSelect,
        likes: { select: { userId: true } },
        _count: { select: { comments: true } },
        comments: {
          where: { parentCommentId: null },
          orderBy: { createdAt: 'desc' },
          include: { author: authorSelect, replies: { include: { author: authorSelect } } },
        },
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
    const profiles = await getIdentityMap('whatsapp');
    return { consejo: fromExtracted(extracted, profiles), comments: [] };
  }

  const advice = await findAdvice(id);
  if (!advice) return null;
  return { consejo: fromAdvice(advice), comments: advice.comments };
};

export type ConsejoDetail = NonNullable<Awaited<ReturnType<typeof getConsejoDetail>>>;
