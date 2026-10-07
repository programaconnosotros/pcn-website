import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';
import { HISTORIA_FLYERS } from '@/components/historia/event-flyers';
import { visibleGalleryItem } from '@/lib/gallery';
import { signGallerySrc } from '@/lib/gallery-signing';

const PHOTOS_PER_EVENT = 8;

export interface HistoriaEvent {
  id: string;
  name: string;
  date: Date;
  flyerImages: string[];
  /** `thumbUrl` is signed: gallery photos on CloudFront only load with a signed URL. */
  photos: { id: string; thumbUrl: string; description: string | null }[];
  photoCount: number;
}

/**
 * The platform events behind the flyers in /historia, with a few of their gallery photos.
 * A database error leaves the story without them instead of breaking the page.
 */
export const getHistoriaEvents = async (): Promise<HistoriaEvent[]> => {
  try {
    // Cached unsigned: signed URLs expire, so they're signed on each request.
    return (await listHistoriaEvents()).map(({ photos, ...event }) => ({
      ...event,
      photos: photos.map(({ thumbSrc, ...photo }) => ({
        ...photo,
        thumbUrl: signGallerySrc(thumbSrc).url,
      })),
    }));
  } catch (error) {
    console.error('historia: failed to load the events', error);
    return [];
  }
};

const listHistoriaEvents = cached(
  'historia-events',
  async () => {
    const events = await prisma.event.findMany({
      where: { deletedAt: null, flyerImages: { hasSome: Object.values(HISTORIA_FLYERS) } },
      select: {
        id: true,
        name: true,
        date: true,
        flyerImages: true,
        galleryItems: {
          where: { ...visibleGalleryItem, kind: 'PHOTO' },
          orderBy: { takenAt: 'asc' },
          take: PHOTOS_PER_EVENT,
          select: { id: true, thumbSrc: true, description: true },
        },
        _count: { select: { galleryItems: { where: { ...visibleGalleryItem, kind: 'PHOTO' } } } },
      },
    });
    return events.map(({ galleryItems, _count, ...event }) => ({
      ...event,
      photos: galleryItems,
      photoCount: _count.galleryItems,
    }));
  },
  { models: ['Event', 'GalleryItem'] },
);
