import { readFile } from 'node:fs/promises';
import path from 'node:path';
import prisma from '@/lib/prisma';
import { photoFileName } from '@/components/photo-gallery/photo-utils';
import { isSignedGallerySrc } from '@/lib/gallery-signing';
import { enforceRateLimit } from '@/lib/rate-limit';
import { CLOUDFRONT_URL, getObjectBuffer } from '@/lib/s3';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Reads the full-size file: from S3 for uploaded photos, from /public for the historical ones.
async function readPhoto(src: string) {
  if (isSignedGallerySrc(src)) return getObjectBuffer(src.slice(CLOUDFRONT_URL.length + 1));

  const file = path.join(PUBLIC_DIR, decodeURIComponent(src));
  if (!src.startsWith('/') || !file.startsWith(`${PUBLIC_DIR}${path.sep}`)) return null;
  return readFile(file);
}

// Downloads a gallery photo as an attachment. Rate limited per user (or IP when logged out).
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await enforceRateLimit('photoDownload');
  } catch (error) {
    const waitSeconds = String(error instanceof Error ? error.message : '').split(':')[1];
    return new Response('Demasiadas descargas, probá en un rato', {
      status: 429,
      headers: waitSeconds ? { 'Retry-After': waitSeconds } : undefined,
    });
  }

  const { id } = await params;
  const photo = await prisma.galleryItem.findUnique({
    where: { id },
    select: { id: true, src: true, takenAt: true },
  });
  if (!photo) return new Response('Foto no encontrada', { status: 404 });

  const file = await readPhoto(photo.src).catch(() => null);
  if (!file) return new Response('Foto no encontrada', { status: 404 });

  return new Response(new Uint8Array(file), {
    headers: {
      'Content-Type': 'image/webp',
      'Content-Disposition': `attachment; filename="${photoFileName(photo)}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
