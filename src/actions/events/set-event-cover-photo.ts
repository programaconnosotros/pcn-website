'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin';
import { visibleGalleryItem } from '@/lib/gallery';
import prisma from '@/lib/prisma';

/**
 * Elige la foto de portada del memorial de un evento (una foto del propio evento) o, con null,
 * vuelve a la portada aleatoria. Solo admins.
 */
export async function setEventCoverPhoto(eventId: string, photoId: string | null) {
  await requireAdmin();

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

  await prisma.event.update({ where: { id: eventId }, data: { coverPhotoId: photoId } });

  revalidatePath(`/eventos/${eventId}`);
  new Set([photoId, event.coverPhotoId]).forEach((id) => id && revalidatePath(`/galeria/${id}`));
}
