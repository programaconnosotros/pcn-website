import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import type { GalleryFilter } from '@/lib/gallery-filters';

// What a tile needs: its kind, caption and enough to search it.
export const galleryTileSelect = {
  id: true,
  kind: true,
  durationSeconds: true,
  src: true,
  takenAt: true,
  description: true,
  event: { select: { id: true, name: true } },
  tags: { select: { user: { select: { name: true } } } },
} satisfies Prisma.GalleryItemSelect;

export type GalleryTile = Prisma.GalleryItemGetPayload<{ select: typeof galleryTileSelect }>;

// Newest first; ties (same instant) by upload order so prev/next stay stable.
export const galleryOrder = [
  { takenAt: 'desc' },
  { createdAt: 'desc' },
  { id: 'desc' },
] satisfies Prisma.GalleryItemOrderByWithRelationInput[];

const galleryWhere = (filter: Partial<GalleryFilter>): Prisma.GalleryItemWhereInput => ({
  ...(filter.type === 'fotos' && { kind: 'PHOTO' }),
  ...(filter.type === 'videos' && { kind: 'VIDEO' }),
  ...(filter.eventId && { eventId: filter.eventId }),
  ...(filter.userId && { tags: { some: { userId: filter.userId } } }),
});

/** Photos and videos of the gallery, mixed, optionally filtered by type, event or person. */
export const listGalleryItems = (filter: Partial<GalleryFilter> = {}) =>
  prisma.galleryItem.findMany({
    where: galleryWhere(filter),
    select: galleryTileSelect,
    orderBy: galleryOrder,
  });

/** The events and the people that have something in the gallery, for its filters. */
export async function getGalleryFilterOptions() {
  const [events, people] = await Promise.all([
    prisma.event.findMany({
      where: { deletedAt: null, galleryItems: { some: {} } },
      select: { id: true, name: true, date: true, _count: { select: { galleryItems: true } } },
      orderBy: { date: 'desc' },
    }),
    prisma.user.findMany({
      where: { galleryTags: { some: {} } },
      select: { id: true, name: true, _count: { select: { galleryTags: true } } },
      orderBy: { name: 'asc' },
    }),
  ]);
  return {
    events: events.map(({ _count, ...event }) => ({ ...event, count: _count.galleryItems })),
    people: people.map(({ _count, ...person }) => ({ ...person, count: _count.galleryTags })),
  };
}

export type GalleryFilterOptions = Awaited<ReturnType<typeof getGalleryFilterOptions>>;

/** A photo or video with everything its page shows: event, people and who tagged them. */
export const getGalleryItem = (id: string) =>
  prisma.galleryItem.findUnique({
    where: { id },
    include: {
      event: { select: { id: true, name: true, date: true } },
      tags: {
        select: {
          taggedById: true,
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

/**
 * The items before and after `id` in the gallery order (wrapping around), within the same
 * filters the visitor was browsing with.
 */
export async function getGalleryNeighbours(id: string, filter: Partial<GalleryFilter> = {}) {
  const ids = (
    await prisma.galleryItem.findMany({
      where: galleryWhere(filter),
      select: { id: true },
      orderBy: galleryOrder,
    })
  ).map((item) => item.id);

  const index = ids.indexOf(id);
  if (index === -1 || ids.length < 2) {
    return { previousId: null, nextId: null, index, total: ids.length };
  }
  return {
    previousId: ids[(index - 1 + ids.length) % ids.length],
    nextId: ids[(index + 1) % ids.length],
    index,
    total: ids.length,
  };
}
