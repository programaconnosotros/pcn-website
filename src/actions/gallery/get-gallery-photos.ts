'use server';

import prisma from '@/lib/prisma';

export async function getGalleryPhotos() {
  return prisma.galleryPhoto.findMany({
    where: { deletedAt: null },
    orderBy: { takenAt: 'desc' },
  });
}
