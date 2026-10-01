'use server';

import prisma from '@/lib/prisma';
import { galleryOrder } from '@/lib/gallery';

// Cuántas fotos del evento se muestran en su página antes de "ver todas".
const EVENT_PHOTOS_PREVIEW = 12;

export const fetchEvent = async (id: string) =>
  prisma.event.findFirst({
    where: {
      id: id,
      deletedAt: null,
    },
    include: {
      galleryItems: {
        select: { id: true, kind: true, src: true, description: true },
        orderBy: galleryOrder,
        take: EVENT_PHOTOS_PREVIEW,
      },
      _count: { select: { galleryItems: true } },
      sponsors: true,
      organizers: {
        select: { userId: true, user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
