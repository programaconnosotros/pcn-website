import prisma from '@/lib/prisma';
import { HISTORIA_FLYERS } from '@/components/historia/event-flyers';

const PHOTOS_PER_EVENT = 8;

export interface HistoriaEvent {
  id: string;
  name: string;
  date: Date;
  flyerImages: string[];
  photos: { id: string; thumbSrc: string; description: string | null }[];
  photoCount: number;
}

/**
 * The platform events behind the flyers in /historia, with a few of their gallery photos.
 * A database error leaves the story without them instead of breaking the page.
 */
export const getHistoriaEvents = async (): Promise<HistoriaEvent[]> => {
  try {
    const events = await prisma.event.findMany({
      where: { deletedAt: null, flyerImages: { hasSome: Object.values(HISTORIA_FLYERS) } },
      select: {
        id: true,
        name: true,
        date: true,
        flyerImages: true,
        galleryItems: {
          where: { kind: 'PHOTO' },
          orderBy: { takenAt: 'asc' },
          take: PHOTOS_PER_EVENT,
          select: { id: true, thumbSrc: true, description: true },
        },
        _count: { select: { galleryItems: { where: { kind: 'PHOTO' } } } },
      },
    });
    return events.map(({ galleryItems, _count, ...event }) => ({
      ...event,
      photos: galleryItems,
      photoCount: _count.galleryItems,
    }));
  } catch (error) {
    console.error('historia: failed to load the events', error);
    return [];
  }
};
