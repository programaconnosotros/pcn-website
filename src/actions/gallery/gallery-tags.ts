'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { requireSessionUser } from '@/actions/projects/get-session-user';
import { enforceRateLimit } from '@/lib/rate-limit';

// Los admins etiquetan y quitan a cualquiera; el resto de los usuarios, solo a sí mismos.
async function requireTagger(userId: string) {
  const viewer = await requireSessionUser();
  if (viewer.role !== 'ADMIN' && viewer.id !== userId) throw new Error('No autorizado');
  await enforceRateLimit('editContent');
  return viewer;
}

const revalidateTag = (itemId: string, userId: string) => {
  revalidatePath('/galeria');
  revalidatePath(`/galeria/${itemId}`);
  revalidatePath(`/perfil/${userId}`);
};

/** Marca que `userId` aparece en la foto. */
export async function tagGalleryItemUser(itemId: string, userId: string) {
  const viewer = await requireTagger(userId);

  const [photo, user] = await Promise.all([
    prisma.galleryItem.findUnique({ where: { id: itemId }, select: { id: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
  ]);
  if (!photo) throw new Error('Foto no encontrada');
  if (!user) throw new Error('Usuario no encontrado');

  await prisma.galleryItemTag.upsert({
    where: { itemId_userId: { itemId, userId } },
    create: { itemId, userId, taggedById: viewer.id },
    update: {},
  });
  revalidateTag(itemId, userId);
  return { success: true };
}

/** Quita la etiqueta de `userId` de la foto. */
export async function untagGalleryItemUser(itemId: string, userId: string) {
  await requireTagger(userId);

  await prisma.galleryItemTag.deleteMany({ where: { itemId, userId } });
  revalidateTag(itemId, userId);
  return { success: true };
}
