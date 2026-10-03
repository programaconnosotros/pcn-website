import { cache } from 'react';
import { findExtractedConsejo } from '@/data/consejos-extraidos';
import { getIdentityMap } from '@/lib/identity-links';
import prisma from '@/lib/prisma';
import { fromAdvise, fromExtracted } from '@/lib/consejos';

const authorSelect = { select: { id: true, name: true, image: true } } as const;

/**
 * One consejo with its comments, published or extracted from a conversation (the `auto-` ids).
 * Memoized per request so metadata, the page and the modal share one lookup.
 */
export const getConsejoDetail = cache(async (id: string) => {
  const extracted = findExtractedConsejo(id);
  if (extracted) {
    const profiles = await getIdentityMap('whatsapp');
    return { consejo: fromExtracted(extracted, profiles), comments: [] };
  }

  const advise = await prisma.advise.findUnique({
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
  });
  if (!advise) return null;
  return { consejo: fromAdvise(advise), comments: advise.comments };
});

export type ConsejoDetail = NonNullable<Awaited<ReturnType<typeof getConsejoDetail>>>;
