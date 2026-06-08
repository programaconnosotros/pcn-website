'use server';

import prisma from '@/lib/prisma';

export async function getGalleryPhoto(id: string) {
  return prisma.galleryPhoto.findFirst({
    where: { id, deletedAt: null },
  });
}
