'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { updateGalleryPhotoSchema, UpdateGalleryPhotoInput } from '@/schemas/gallery-photo-schema';

export async function updateGalleryPhoto(data: UpdateGalleryPhotoInput) {
  const sessionId = cookies().get('sessionId')?.value;

  if (!sessionId) {
    throw new Error('No autorizado');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('No tienes permisos para editar fotos');
  }

  const validatedData = updateGalleryPhotoSchema.parse(data);

  const photo = await prisma.galleryPhoto.update({
    where: { id: validatedData.id },
    data: {
      title: validatedData.title,
      location: validatedData.location,
      takenAt: validatedData.takenAt,
      imageUrl: validatedData.imageUrl,
    },
  });

  revalidatePath('/galeria');

  return photo;
}
