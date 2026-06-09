import prisma from '@/lib/prisma';

/**
 * Finds the next upcoming event that has the given shortcut slug.
 * Multiple events can share the same slug (e.g. every cowork session uses "cowork");
 * this always returns the nearest future one.
 */
export async function findNextEventByShortcut(
  slug: string,
  opts: { includeImages?: boolean } = {},
) {
  const now = new Date();

  return prisma.event.findFirst({
    where: {
      deletedAt: null,
      shortcut: slug.toLowerCase(),
      OR: [{ date: { gte: now } }, { endDate: { gte: now } }],
    },
    orderBy: { date: 'asc' },
    ...(opts.includeImages && { include: { images: true } }),
  });
}

/**
 * Converts a URL slug into a display label for fallback metadata.
 * e.g. "nextgen" → "Nextgen", "dev-meetup" → "Dev-meetup"
 */
export function slugToLabel(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}
