import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import type { GalleryFilter } from '@/lib/gallery-filters';
import { signGalleryItem, signGallerySrc } from '@/lib/gallery-signing';

/**
 * The items the gallery shows: the photos of the old static gallery (the ones with a
 * `legacyId`, served from /public) are kept in the database but no longer shown.
 */
export const visibleGalleryItem = { legacyId: null } satisfies Prisma.GalleryItemWhereInput;

// What a tile needs: its kind, caption, thumbnail and enough to search it.
export const galleryTileSelect = {
  id: true,
  kind: true,
  durationSeconds: true,
  src: true,
  thumbSrc: true,
  takenAt: true,
  description: true,
  event: { select: { id: true, name: true } },
  tags: { select: { user: { select: { id: true, name: true } } } },
} satisfies Prisma.GalleryItemSelect;

export type GalleryTile = ReturnType<
  typeof signGalleryItem<Prisma.GalleryItemGetPayload<{ select: typeof galleryTileSelect }>>
>;

// Newest first; ties (same instant) by upload order so prev/next stay stable.
export const galleryOrder = [
  { takenAt: 'desc' },
  { createdAt: 'desc' },
  { id: 'desc' },
] satisfies Prisma.GalleryItemOrderByWithRelationInput[];

const galleryWhere = (filter: Partial<GalleryFilter>): Prisma.GalleryItemWhereInput => ({
  ...visibleGalleryItem,
  ...(filter.type === 'fotos' && { kind: 'PHOTO' }),
  ...(filter.type === 'videos' && { kind: 'VIDEO' }),
  ...(filter.eventId && { eventId: filter.eventId }),
  ...(filter.userId && { tags: { some: { userId: filter.userId } } }),
});

/** Photos and videos of the gallery, mixed, optionally filtered by type, event or person. */
export const listGalleryItems = async (filter: Partial<GalleryFilter> = {}) =>
  (
    await prisma.galleryItem.findMany({
      where: galleryWhere(filter),
      select: galleryTileSelect,
      orderBy: galleryOrder,
    })
  ).map(signGalleryItem);

/** The events and the people that have something in the gallery, for its filters. */
export async function getGalleryFilterOptions() {
  const [events, people] = await Promise.all([
    prisma.event.findMany({
      where: { deletedAt: null, galleryItems: { some: visibleGalleryItem } },
      select: {
        id: true,
        name: true,
        date: true,
        _count: { select: { galleryItems: { where: visibleGalleryItem } } },
      },
      orderBy: { date: 'desc' },
    }),
    prisma.user.findMany({
      where: { galleryTags: { some: { item: visibleGalleryItem } } },
      select: {
        id: true,
        name: true,
        _count: { select: { galleryTags: { where: { item: visibleGalleryItem } } } },
      },
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
export async function getGalleryItem(id: string) {
  const item = await prisma.galleryItem.findFirst({
    where: { id, ...visibleGalleryItem },
    include: {
      event: {
        select: {
          id: true,
          name: true,
          date: true,
          isOnline: true,
          placeName: true,
          address: true,
          city: true,
          googleMapsUrl: true,
          coverPhotoId: true,
        },
      },
      tags: {
        select: {
          taggedById: true,
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
  return item && signGalleryItem(item);
}

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

/**
 * What a past event's page shows of it: up to `take` photos and videos in the order they were
 * taken (the night told from the start), how many there are of each kind and who appears in them.
 */
export async function getEventMemories(eventId: string, take: number) {
  const where = { ...visibleGalleryItem, eventId } satisfies Prisma.GalleryItemWhereInput;
  const [items, kinds, people] = await Promise.all([
    prisma.galleryItem.findMany({
      where,
      select: {
        id: true,
        kind: true,
        src: true,
        thumbSrc: true,
        width: true,
        height: true,
        durationSeconds: true,
        takenAt: true,
        description: true,
      },
      orderBy: [{ takenAt: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
      take,
    }),
    prisma.galleryItem.groupBy({ by: ['kind'], where, _count: true }),
    prisma.user.findMany({
      where: { galleryTags: { some: { item: where } } },
      select: { id: true, name: true, image: true },
      orderBy: { name: 'asc' },
    }),
  ]);
  const count = (kind: 'PHOTO' | 'VIDEO') => kinds.find((row) => row.kind === kind)?._count ?? 0;
  return {
    items: items.map(signGalleryItem),
    photoCount: count('PHOTO'),
    videoCount: count('VIDEO'),
    people,
  };
}

export type EventMemories = Awaited<ReturnType<typeof getEventMemories>>;
export type EventMemoryItem = EventMemories['items'][number];

// Wide enough to fill the memorial's header without an awkward crop.
const COVER_MIN_RATIO = 1.3;
const isLandscape = (item: { width: number | null; height: number | null }) =>
  !!item.width && !!item.height && item.width / item.height >= COVER_MIN_RATIO;

/**
 * The photos for a past event's header: the one an admin chose, or else up to `take` of its
 * landscape photos in random order (the header cycles through them). `photos` lists every photo
 * of the event, in the order they were taken, for the admin's cover picker.
 */
export async function getEventCover(eventId: string, coverPhotoId: string | null, take = 6) {
  const photos = (
    await prisma.galleryItem.findMany({
      where: { ...visibleGalleryItem, eventId, kind: 'PHOTO' },
      select: { id: true, src: true, thumbSrc: true, width: true, height: true },
      orderBy: [{ takenAt: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
    })
  ).map(signGalleryItem);

  const chosen = coverPhotoId ? photos.find((photo) => photo.id === coverPhotoId) : undefined;
  const landscape = photos.filter(isLandscape);
  for (let i = landscape.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [landscape[i], landscape[j]] = [landscape[j], landscape[i]];
  }

  return {
    chosenId: chosen?.id ?? null,
    covers: chosen ? [chosen] : landscape.slice(0, take),
    photos,
  };
}

export type EventCover = Awaited<ReturnType<typeof getEventCover>>;

/** The most recently uploaded photos and videos, newest upload first. */
export const listLatestGalleryItems = async (take: number) =>
  (
    await prisma.galleryItem.findMany({
      where: visibleGalleryItem,
      select: galleryTileSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take,
    })
  ).map(signGalleryItem);

/** A random sample of the gallery's photos (no videos), for the PCN OS desktop widget. */
export async function listRandomGalleryPhotos(take: number) {
  const where = { ...visibleGalleryItem, kind: 'PHOTO' } satisfies Prisma.GalleryItemWhereInput;
  const ids = (await prisma.galleryItem.findMany({ where, select: { id: true } })).map(
    (item) => item.id,
  );
  // Partial Fisher–Yates: the first `take` slots end up a uniform random sample.
  for (let i = 0; i < Math.min(take, ids.length); i++) {
    const j = i + Math.floor(Math.random() * (ids.length - i));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  const sample = ids.slice(0, take);
  const items = await prisma.galleryItem.findMany({
    where: { id: { in: sample } },
    select: { id: true, thumbSrc: true },
  });
  return items
    .sort((a, b) => sample.indexOf(a.id) - sample.indexOf(b.id))
    .map((item) => ({ id: item.id, thumbUrl: signGallerySrc(item.thumbSrc).url }));
}

export type RandomGalleryPhoto = Awaited<ReturnType<typeof listRandomGalleryPhotos>>[number];

/**
 * Gallery photos for the home's story cards, shuffled and dealt into two pools that never share
 * a photo: one rotates behind "historia", the other behind "galería".
 */
export async function listStoryCardPhotos(perCard = 20) {
  const items = await prisma.galleryItem.findMany({
    where: { ...visibleGalleryItem, kind: 'PHOTO' },
    select: { src: true },
  });
  // One entry per image file, so the two pools can't end up showing the same picture.
  const sources = [...new Set(items.map((item) => item.src))];
  for (let i = sources.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sources[i], sources[j]] = [sources[j], sources[i]];
  }
  const urls = sources.slice(0, perCard * 2).map((src) => signGallerySrc(src).url);
  return {
    historia: urls.filter((_, index) => index % 2 === 0),
    galeria: urls.filter((_, index) => index % 2 === 1),
  };
}

export type StoryCardPhotos = Awaited<ReturnType<typeof listStoryCardPhotos>>;
