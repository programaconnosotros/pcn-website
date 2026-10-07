'use server';

import { revalidatePath } from 'next/cache';
import { requireEventManager } from '@/lib/event-access';
import { visibleGalleryItem } from '@/lib/gallery';
import prisma from '@/lib/prisma';

/**
 * Elige la foto de portada del memorial de un evento (una foto del propio evento) o, con null,
 * vuelve a la portada aleatoria. Quien puede editar el evento: admins y sus organizadores. Una
 * portada nueva arranca sin encuadre.
 */
export async function setEventCoverPhoto(eventId: string, photoId: string | null) {
  await requireEventManager(eventId);

  const event = await prisma.event.findFirst({
    where: { id: eventId, deletedAt: null },
    select: { id: true, coverPhotoId: true },
  });
  if (!event) throw new Error('Evento no encontrado');

  if (photoId) {
    const photo = await prisma.galleryItem.findFirst({
      where: { ...visibleGalleryItem, id: photoId, eventId, kind: 'PHOTO' },
      select: { id: true },
    });
    if (!photo) throw new Error('La foto no es de este evento');
  }

  await prisma.event.update({
    where: { id: eventId },
    data: {
      coverPhotoId: photoId,
      ...(photoId !== event.coverPhotoId && { coverFocusX: 50, coverFocusY: 50, coverZoom: 100 }),
    },
  });

  revalidatePath(`/eventos/${eventId}`);
  new Set([photoId, event.coverPhotoId]).forEach((id) => id && revalidatePath(`/galeria/${id}`));
}
