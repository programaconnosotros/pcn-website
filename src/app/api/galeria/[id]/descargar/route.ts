import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { photoFileName } from '@/components/photo-gallery/photo-utils';
import { isSignedGallerySrc } from '@/lib/gallery-signing';
import { enforceRateLimit } from '@/lib/rate-limit';
import { CLOUDFRONT_URL, getPresignedDownloadUrl } from '@/lib/s3';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Downloads a gallery photo or video as an attachment, rate limited per user (or IP when logged
// out). Uploaded files redirect to a presigned S3 URL, so videos never pass through the server;
// the historical photos are read from /public.
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
  const item = await prisma.galleryItem.findUnique({
    where: { id },
    select: { id: true, src: true, takenAt: true },
  });
  if (!item) return new Response('No encontrado', { status: 404 });

  const fileName = photoFileName(item);

  if (isSignedGallerySrc(item.src)) {
    const url = await getPresignedDownloadUrl(item.src.slice(CLOUDFRONT_URL.length + 1), fileName);
    const response = NextResponse.redirect(url, 302);
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  }

  const file = path.join(PUBLIC_DIR, decodeURIComponent(item.src));
  if (!item.src.startsWith('/') || !file.startsWith(`${PUBLIC_DIR}${path.sep}`)) {
    return new Response('No encontrado', { status: 404 });
  }
  const content = await readFile(file).catch(() => null);
  if (!content) return new Response('No encontrado', { status: 404 });

  return new Response(new Uint8Array(content), {
    headers: {
      'Content-Type': 'image/webp',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
