import type { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';
import type { GalleryFilter } from '@/lib/gallery-filters';
import { signGalleryItem, signGallerySrc } from '@/lib/gallery-signing';

/**
 * The items the gallery shows: the approved ones (what members upload waits for an admin), but
 * not the photos of the old static gallery (the ones with a `legacyId`, served from /public),
 * which are kept in the database but no longer shown.
 */
export const visibleGalleryItem = {
  legacyId: null,
  status: 'APPROVED',
} satisfies Prisma.GalleryItemWhereInput;

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
  ...(filter.type === 'trabajando' && { working: true }),
  ...(filter.eventId && { eventId: filter.eventId }),
  ...(filter.userId && { tags: { some: { userId: filter.userId } } }),
});

// Everything below is cached unsigned: signed URLs expire, so they are signed on each request
// (src/lib/gallery-signing.ts keeps each signature for its hour).
const GALLERY_MODELS = ['GalleryItem', 'GalleryItemTag', 'Event', 'User'] as const;

// Only the fields that filter, so `{ type: undefined }` and `{}` share a cache entry.
const filterKey = ({ type, eventId, userId }: Partial<GalleryFilter>) => ({
  type,
  eventId,
  userId,
});

const listGalleryTiles = cached(
  'gallery-tiles',
  (filter: Partial<GalleryFilter>) =>
    prisma.galleryItem.findMany({
      where: galleryWhere(filter),
      select: galleryTileSelect,
      orderBy: galleryOrder,
    }),
  { models: GALLERY_MODELS },
);

/** Photos and videos of the gallery, mixed, optionally filtered by type, event or person. */
export const listGalleryItems = async (filter: Partial<GalleryFilter> = {}) =>
  (await listGalleryTiles(filterKey(filter))).map(signGalleryItem);

/** The events and the people that have something in the gallery, for its filters. */
export const getGalleryFilterOptions = cached(
  'gallery-filter-options',
  async () => {
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
  },
  { models: GALLERY_MODELS },
);

export type GalleryFilterOptions = Awaited<ReturnType<typeof getGalleryFilterOptions>>;

const findGalleryItem = cached(
  'gallery-item',
  (id: string) =>
    prisma.galleryItem.findFirst({
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
            x: true,
            y: true,
            user: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    }),
  { models: GALLERY_MODELS },
);

/** A photo or video with everything its page shows: event, people and who tagged them. */
export async function getGalleryItem(id: string) {
  const item = await findGalleryItem(id);
  return item && signGalleryItem(item);
}

/**
 * The items before and after `id` in the gallery order (wrapping around), within the same
 * filters the visitor was browsing with.
 */
export async function getGalleryNeighbours(id: string, filter: Partial<GalleryFilter> = {}) {
  const tiles = await listGalleryTiles(filterKey(filter));
  const index = tiles.findIndex((item) => item.id === id);
  if (index === -1 || tiles.length < 2) {
    return {
      previousId: null,
      nextId: null,
      previous: null,
      next: null,
      index,
      total: tiles.length,
    };
  }
  const previous = tiles[(index - 1 + tiles.length) % tiles.length];
  const next = tiles[(index + 1) % tiles.length];
  // What the photo page needs to preload the neighbours' files, signed for this request.
  const preloadable = ({ id, kind, src, thumbSrc }: (typeof tiles)[number]) => {
    const { thumbUrl, fullUrl } = signGalleryItem({ src, thumbSrc });
    return { id, kind, thumbUrl, fullUrl };
  };
  return {
    previousId: previous.id,
    nextId: next.id,
    previous: preloadable(previous),
    next: preloadable(next),
    index,
    total: tiles.length,
  };
}

/**
 * What a past event's page shows of it: up to `take` photos and videos in the order they were
 * taken (the night told from the start), how many there are of each kind and who appears in them.
 */
const findEventMemories = cached(
  'event-memories',
  async (eventId: string, take: number) => {
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
    return { items, photoCount: count('PHOTO'), videoCount: count('VIDEO'), people };
  },
  { models: GALLERY_MODELS },
);

export async function getEventMemories(eventId: string, take: number) {
  const memories = await findEventMemories(eventId, take);
  return { ...memories, items: memories.items.map(signGalleryItem) };
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
const listEventPhotos = cached(
  'event-photos',
  (eventId: string) =>
    prisma.galleryItem.findMany({
      where: { ...visibleGalleryItem, eventId, kind: 'PHOTO' },
      select: { id: true, src: true, thumbSrc: true, width: true, height: true },
      orderBy: [{ takenAt: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
    }),
  { models: ['GalleryItem'] },
);

export async function getEventCover(eventId: string, coverPhotoId: string | null, take = 6) {
  const photos = (await listEventPhotos(eventId)).map(signGalleryItem);

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

/**
 * The most recent photos and videos by when they were taken, newest first: uploading an old
 * album shouldn't push last week's event off the home.
 */
const findLatestGalleryItems = cached(
  'gallery-latest',
  (take: number) =>
    prisma.galleryItem.findMany({
      where: visibleGalleryItem,
      select: galleryTileSelect,
      orderBy: [{ takenAt: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
      take,
    }),
  { models: GALLERY_MODELS },
);

export const listLatestGalleryItems = async (take: number) =>
  (await findLatestGalleryItems(take)).map(signGalleryItem);

// Every photo's file, for the random samples below: one cached query instead of one per visit.
const listGalleryPhotoFiles = cached(
  'gallery-photo-files',
  () =>
    prisma.galleryItem.findMany({
      where: { ...visibleGalleryItem, kind: 'PHOTO' },
      select: { id: true, src: true, thumbSrc: true },
    }),
  { models: ['GalleryItem'] },
);

/** A random sample of the gallery's photos (no videos), for the PCN OS desktop widget. */
export async function listRandomGalleryPhotos(take: number) {
  const photos = [...(await listGalleryPhotoFiles())];
  // Partial Fisher–Yates: the first `take` slots end up a uniform random sample.
  for (let i = 0; i < Math.min(take, photos.length); i++) {
    const j = i + Math.floor(Math.random() * (photos.length - i));
    [photos[i], photos[j]] = [photos[j], photos[i]];
  }
  return photos
    .slice(0, take)
    .map((item) => ({ id: item.id, thumbUrl: signGallerySrc(item.thumbSrc).url }));
}

export type RandomGalleryPhoto = Awaited<ReturnType<typeof listRandomGalleryPhotos>>[number];

/**
 * Gallery photos for the home's story cards, shuffled and dealt into two pools that never share
 * a photo: one rotates behind "historia", the other behind "galería".
 */
export async function listStoryCardPhotos(perCard = 20) {
  const items = await listGalleryPhotoFiles();
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

/**
 * What members uploaded and an admin hasn't reviewed yet, oldest first (the queue). Only for
 * admins, so never cached: it changes with every upload and review.
 */
export async function listPendingGalleryItems() {
  const items = await prisma.galleryItem.findMany({
    where: { legacyId: null, status: 'PENDING' },
    select: {
      id: true,
      kind: true,
      src: true,
      thumbSrc: true,
      takenAt: true,
      createdAt: true,
      description: true,
      working: true,
      event: { select: { id: true, name: true } },
      uploadedBy: { select: { id: true, name: true, image: true } },
    },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  });
  return items.map(signGalleryItem);
}

export type PendingGalleryItem = Awaited<ReturnType<typeof listPendingGalleryItems>>[number];

/** How many uploads wait for an admin, for the link from the gallery. */
export const countPendingGalleryItems = () =>
  prisma.galleryItem.count({ where: { legacyId: null, status: 'PENDING' } });

const listWorkingPhotos = cached(
  'gallery-working-photos',
  (userId: string) =>
    prisma.galleryItem.findMany({
      where: { ...visibleGalleryItem, working: true, tags: { some: { userId } } },
      select: { id: true, kind: true, description: true, src: true, thumbSrc: true },
      orderBy: galleryOrder,
    }),
  { models: ['GalleryItem', 'GalleryItemTag'] },
);

/** The photos of someone at work (they appear in them), for their profile. */
export const getWorkingPhotos = async (userId: string) =>
  (await listWorkingPhotos(userId)).map(signGalleryItem);

/** The working photos someone uploaded that still wait for approval: only they see them. */
export async function getPendingWorkingPhotos(userId: string) {
  const items = await prisma.galleryItem.findMany({
    where: { legacyId: null, status: 'PENDING', working: true, uploadedById: userId },
    select: { id: true, kind: true, description: true, src: true, thumbSrc: true },
    orderBy: galleryOrder,
  });
  return items.map(signGalleryItem);
}
