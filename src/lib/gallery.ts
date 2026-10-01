import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

// What a photo tile needs: the thumbnail, its caption and enough to search it.
export const galleryTileSelect = {
  id: true,
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

/** Photos of the gallery, optionally only the ones from an event or where a user appears. */
export const listGalleryItems = (filter: { eventId?: string; userId?: string } = {}) =>
  prisma.galleryItem.findMany({
    where: {
      ...(filter.eventId && { eventId: filter.eventId }),
      ...(filter.userId && { tags: { some: { userId: filter.userId } } }),
    },
    select: galleryTileSelect,
    orderBy: galleryOrder,
  });

/** A photo with everything its page shows: event, people and who tagged them. */
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
 * The photos before and after `id` in the gallery order (wrapping around), within an event
 * when browsing that event's photos.
 */
export async function getGalleryNeighbours(id: string, eventId?: string) {
  const ids = (
    await prisma.galleryItem.findMany({
      where: eventId ? { eventId } : undefined,
      select: { id: true },
      orderBy: galleryOrder,
    })
  ).map((photo) => photo.id);

  const index = ids.indexOf(id);
  if (index === -1 || ids.length < 2)
    return { previousId: null, nextId: null, index, total: ids.length };
  return {
    previousId: ids[(index - 1 + ids.length) % ids.length],
    nextId: ids[(index + 1) % ids.length],
    index,
    total: ids.length,
  };
}
