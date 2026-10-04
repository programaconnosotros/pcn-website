import prisma from '@/lib/prisma';
import { getRateLimitWait } from '@/lib/rate-limit';
import { getPresignedDownloadUrl } from '@/lib/s3';
import { GET } from '@/app/api/galeria/[id]/descargar/route';
import { uniqueId } from '@/test/db/content-fixtures';

// Descarga de fotos y videos de la galería contra Postgres real. S3 se reemplaza.

jest.mock('@/lib/s3', () => ({
  CLOUDFRONT_URL: 'https://cdn.test',
  getPresignedDownloadUrl: jest.fn().mockResolvedValue('https://s3.test/descarga'),
}));

const download = (id: string) =>
  GET(new Request(`https://pcn.test/api/galeria/${id}/descargar`), {
    params: Promise.resolve({ id }),
  });

const createItem = (src: string, data: { legacyId?: number } = {}) =>
  prisma.galleryItem.create({
    data: { src, thumbSrc: src, takenAt: new Date('2025-05-10T20:00:00Z'), ...data },
  });

it('answers uploaded files with a presigned S3 URL named after the photo', async () => {
  const id = uniqueId();
  const item = await createItem(`https://cdn.test/gallery/${id}/full.webp`);

  const response = await download(item.id);

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ url: 'https://s3.test/descarga' });
  expect(getPresignedDownloadUrl).toHaveBeenCalledWith(
    `gallery/${id}/full.webp`,
    expect.stringMatching(/^pcn-.*\.webp$/),
  );
});

it('serves photos stored in /public as an attachment', async () => {
  const item = await createItem('/IMG_0618.webp');

  const response = await download(item.id);

  expect(response.status).toBe(200);
  expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="IMG_0618.webp"');
  expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(0);
});

it('answers 404 for missing, legacy, missing-on-disk and path-traversal items', async () => {
  const legacy = await createItem('/IMG_0618.webp', { legacyId: Math.floor(Math.random() * 1e9) });
  const missingFile = await createItem(`/no-existe-${uniqueId()}.webp`);
  const traversal = await createItem('/../package.json');
  const encoded = await createItem('/%2e%2e/package.json');

  for (const id of ['no-existe', legacy.id, missingFile.id, traversal.id, encoded.id]) {
    expect((await download(id)).status).toBe(404);
  }
  expect(getPresignedDownloadUrl).not.toHaveBeenCalled();
});

it('answers 429 while rate limited, before touching the database', async () => {
  (getRateLimitWait as jest.Mock).mockResolvedValueOnce(30);
  const findFirst = jest.spyOn(prisma.galleryItem, 'findFirst');

  const response = await download('lo-que-sea');

  expect(response.status).toBe(429);
  expect(response.headers.get('Retry-After')).toBe('30');
  expect(findFirst).not.toHaveBeenCalled();
  findFirst.mockRestore();
});
