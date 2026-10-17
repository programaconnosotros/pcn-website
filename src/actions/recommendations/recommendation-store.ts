// Server-only helpers for the recommendation actions. Not a 'use server' file: nothing here can
// be called from the browser.

import prisma from '@/lib/prisma';
import type { RecommendationKind, RecommendationStatus } from '@/generated/prisma/client';
import { slugify, type RecommendationData } from '@/schemas/recommendation-schema';

export type ActionResult<T = object> = ({ success: true } & T) | { success: false; error: string };

/** Why a recommendation can't be added again, depending on where the existing one is. */
export const DUPLICATE_MESSAGES: Record<RecommendationStatus, string> = {
  APPROVED: 'Ya está en la lista: alguien lo recomendó antes.',
  PENDING: 'Alguien ya lo recomendó y está esperando que un admin lo revise.',
  REJECTED: 'Ya lo revisamos y decidimos no sumarlo.',
};

const withoutTrailingSlash = (url: string) => url.replace(/\/+$/, '');

/** An existing item that is the same thing: same video, same link, same ISBN or title. */
export const findDuplicate = async (
  kind: RecommendationKind,
  data: Pick<RecommendationData, 'url' | 'isbn' | 'title'>,
  youtubeId: string | null,
  exceptId?: string,
) => {
  const same = [];
  if (kind === 'VIDEO' && youtubeId) same.push({ slug: youtubeId });
  if (data.url && kind !== 'VIDEO') {
    const url = withoutTrailingSlash(data.url);
    same.push(
      { url: { equals: url, mode: 'insensitive' as const } },
      { url: { equals: `${url}/`, mode: 'insensitive' as const } },
    );
  }
  if (kind === 'BOOK') {
    if (data.isbn) same.push({ isbn: data.isbn });
    same.push({ title: { equals: data.title, mode: 'insensitive' as const } });
  }
  if (same.length === 0) return null;
  return prisma.recommendation.findFirst({
    where: { kind, OR: same, ...(exceptId && { id: { not: exceptId } }) },
    select: { id: true, status: true },
  });
};

/** A slug from the title that no other item of the kind uses: `clean-code`, `clean-code-2`. */
export const uniqueSlug = async (kind: RecommendationKind, title: string) => {
  const base = slugify(title);
  const taken = new Set(
    (
      await prisma.recommendation.findMany({
        where: { kind, slug: { startsWith: base } },
        select: { slug: true },
      })
    ).map(({ slug }) => slug),
  );
  if (!taken.has(base)) return base;
  for (let suffix = 2; ; suffix++) {
    if (!taken.has(`${base}-${suffix}`)) return `${base}-${suffix}`;
  }
};

/** Puts a newly published item after the ones already listed (it only breaks same-day ties). */
export const nextPosition = async (kind: RecommendationKind) => {
  const { _max } = await prisma.recommendation.aggregate({
    where: { kind },
    _max: { position: true },
  });
  return (_max.position ?? -1) + 1;
};

export const isUniqueViolation = (error: unknown) =>
  (error as { code?: string } | null)?.code === 'P2002';
