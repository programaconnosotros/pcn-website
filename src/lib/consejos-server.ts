import { findExtractedConsejo } from '@/data/consejos-extraidos';
import { getIdentityMap } from '@/lib/identity-links';
import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';
import { fromAdvise, fromExtracted } from '@/lib/consejos';

const authorSelect = { select: { id: true, name: true, image: true } } as const;

const ADVISE_MODELS = ['Advise', 'User', 'Like', 'Comment'] as const;

/** Every published consejo, newest first, with its likes and comment count. Cached. */
export const listAdvises = cached(
  'advises',
  () =>
    prisma.advise.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: authorSelect,
        likes: { select: { userId: true } },
        _count: { select: { comments: true } },
      },
    }),
  { models: ADVISE_MODELS },
);

const findAdvise = cached(
  'advise',
  (id: string) =>
    prisma.advise.findUnique({
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
  { models: ADVISE_MODELS },
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

  const advise = await findAdvise(id);
  if (!advise) return null;
  return { consejo: fromAdvise(advise), comments: advise.comments };
};

export type ConsejoDetail = NonNullable<Awaited<ReturnType<typeof getConsejoDetail>>>;
