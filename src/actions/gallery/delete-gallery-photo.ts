'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function deleteGalleryPhoto(id: string) {
  const sessionId = cookies().get('sessionId')?.value;

  if (!sessionId) {
    throw new Error('No autorizado');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('No tienes permisos para eliminar fotos');
  }

  await prisma.galleryPhoto.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath('/galeria');

  return { success: true };
}
