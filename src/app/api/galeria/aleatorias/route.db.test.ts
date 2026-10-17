import prisma from '@/lib/prisma';
import { GET } from '@/app/api/galeria/aleatorias/route';
import { uniqueId } from '@/test/db/content-fixtures';

// Muestra al azar de fotos de la galería para el escritorio de PCN OS, contra Postgres real.

jest.mock('@/lib/s3', () => ({ CLOUDFRONT_URL: '' }));

it('samples visible photos only (no videos, no legacy photos), uncached', async () => {
  const create = (data: { kind?: 'PHOTO' | 'VIDEO'; legacyId?: number } = {}) => {
    const id = uniqueId();
    return prisma.galleryItem.create({
      data: { src: `/r/${id}.webp`, thumbSrc: `/r/${id}-t.webp`, takenAt: new Date(), ...data },
    });
  };
  const photo = await create();
  const video = await create({ kind: 'VIDEO' });
  const legacy = await create({ legacyId: Math.floor(Math.random() * 1e9) });

  const response = await GET();
  const { photos } = (await response.json()) as { photos: { id: string; thumbUrl: string }[] };

  expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  const ids = photos.map((p) => p.id);
  expect(ids).not.toContain(video.id);
  expect(ids).not.toContain(legacy.id);
  // Menos de 40 fotos en la base: la muestra las trae todas
  if ((await prisma.galleryItem.count({ where: { kind: 'PHOTO', legacyId: null } })) <= 40) {
    expect(photos).toContainEqual({ id: photo.id, thumbUrl: photo.thumbSrc });
  }
  expect(photos.length).toBeLessThanOrEqual(40);
});
