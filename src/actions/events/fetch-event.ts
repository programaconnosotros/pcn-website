'use server';

import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';
import { galleryOrder, visibleGalleryItem } from '@/lib/gallery';

// Cuántas fotos del evento se muestran en su página antes de "ver todas".
const EVENT_PHOTOS_PREVIEW = 12;

export const fetchEvent = async (id: string) => findEvent(id);

const findEvent = cached(
  'event',
  (id: string) =>
    prisma.event.findFirst({
      where: {
        id: id,
        deletedAt: null,
      },
      include: {
        galleryItems: {
          where: visibleGalleryItem,
          select: { id: true, kind: true, src: true, thumbSrc: true, description: true },
          orderBy: galleryOrder,
          take: EVENT_PHOTOS_PREVIEW,
        },
        _count: { select: { galleryItems: { where: visibleGalleryItem } } },
        sponsors: true,
        flyerDesigners: {
          select: {
            id: true,
            name: true,
            user: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        organizers: {
          select: { userId: true, user: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    }),
  {
    models: ['Event', 'GalleryItem', 'Sponsor', 'EventOrganizer', 'EventFlyerDesigner', 'User'],
  },
);
