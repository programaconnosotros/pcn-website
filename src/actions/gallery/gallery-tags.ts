'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { requireSessionUser } from '@/actions/projects/get-session-user';
import { enforceRateLimit } from '@/lib/rate-limit';
import { requireAdmin } from '@/lib/admin';
import { parseGalleryItemIds } from './gallery-schema';

// Los admins etiquetan y quitan a cualquiera; el resto de los usuarios, solo a sí mismos.
async function requireTagger(userId: string) {
  const viewer = await requireSessionUser();
  if (viewer.role !== 'ADMIN' && viewer.id !== userId) throw new Error('No autorizado');
  await enforceRateLimit('editContent');
  return viewer;
}

const revalidateTags = (itemIds: string[], userId: string) => {
  revalidatePath('/galeria');
  itemIds.forEach((itemId) => revalidatePath(`/galeria/${itemId}`));
  revalidatePath(`/perfil/${userId}`);
};

const revalidateTag = (itemId: string, userId: string) => revalidateTags([itemId], userId);

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

/** Marca que `userId` aparece en varias fotos y videos a la vez. Solo admins. */
export async function bulkTagGalleryItemsUser(itemIds: string[], userId: string) {
  const admin = await requireAdmin();
  const ids = parseGalleryItemIds(itemIds);

  const [items, user] = await Promise.all([
    prisma.galleryItem.findMany({ where: { id: { in: ids } }, select: { id: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
  ]);
  if (!user) throw new Error('Usuario no encontrado');

  const { count } = await prisma.galleryItemTag.createMany({
    data: items.map((item) => ({ itemId: item.id, userId, taggedById: admin.id })),
    skipDuplicates: true,
  });
  revalidateTags(
    items.map((item) => item.id),
    userId,
  );
  return { tagged: count };
}

/** Quita la etiqueta de `userId` de varias fotos y videos a la vez. Solo admins. */
export async function bulkUntagGalleryItemsUser(itemIds: string[], userId: string) {
  await requireAdmin();
  const ids = parseGalleryItemIds(itemIds);

  const { count } = await prisma.galleryItemTag.deleteMany({
    where: { itemId: { in: ids }, userId },
  });
  revalidateTags(ids, userId);
  return { untagged: count };
}
