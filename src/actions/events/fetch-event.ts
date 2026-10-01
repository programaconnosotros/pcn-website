'use server';

import prisma from '@/lib/prisma';
import { photoOrder } from '@/lib/photos';

// Cuántas fotos del evento se muestran en su página antes de "ver todas".
const EVENT_PHOTOS_PREVIEW = 12;

export const fetchEvent = async (id: string) =>
  prisma.event.findFirst({
    where: {
      id: id,
      deletedAt: null,
    },
    include: {
      photos: {
        select: { id: true, thumbSrc: true, src: true, description: true },
        orderBy: photoOrder,
        take: EVENT_PHOTOS_PREVIEW,
      },
      _count: { select: { photos: true } },
      sponsors: true,
      organizers: {
        select: { userId: true, user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
