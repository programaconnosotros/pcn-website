import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

// What a photo tile needs: the thumbnail, its caption and enough to search it.
export const photoTileSelect = {
  id: true,
  src: true,
  takenAt: true,
  description: true,
  event: { select: { id: true, name: true } },
  tags: { select: { user: { select: { name: true } } } },
} satisfies Prisma.PhotoSelect;

export type PhotoTile = Prisma.PhotoGetPayload<{ select: typeof photoTileSelect }>;

// Newest first; ties (same instant) by upload order so prev/next stay stable.
export const photoOrder = [
  { takenAt: 'desc' },
  { createdAt: 'desc' },
  { id: 'desc' },
] satisfies Prisma.PhotoOrderByWithRelationInput[];

/** Photos of the gallery, optionally only the ones from an event or where a user appears. */
export const listPhotos = (filter: { eventId?: string; userId?: string } = {}) =>
  prisma.photo.findMany({
    where: {
      ...(filter.eventId && { eventId: filter.eventId }),
      ...(filter.userId && { tags: { some: { userId: filter.userId } } }),
    },
    select: photoTileSelect,
    orderBy: photoOrder,
  });

/** A photo with everything its page shows: event, people and who tagged them. */
export const getPhoto = (id: string) =>
  prisma.photo.findUnique({
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
export async function getPhotoNeighbours(id: string, eventId?: string) {
  const ids = (
    await prisma.photo.findMany({
      where: eventId ? { eventId } : undefined,
      select: { id: true },
      orderBy: photoOrder,
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
