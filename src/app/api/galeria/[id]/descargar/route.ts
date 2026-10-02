import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { photoFileName } from '@/components/photo-gallery/photo-utils';
import { isSignedGallerySrc } from '@/lib/gallery-signing';
import { visibleGalleryItem } from '@/lib/gallery';
import { getRateLimitWait } from '@/lib/rate-limit';
import { rateLimitMessage } from '@/lib/rate-limit-messages';
import { CLOUDFRONT_URL, getPresignedDownloadUrl } from '@/lib/s3';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Downloads a gallery photo or video as an attachment, rate limited per user (or IP when logged
// out). Uploaded files answer with a presigned S3 URL as JSON, which the download key then opens,
// so videos never pass through the server. It isn't a redirect because the production proxy turns
// 302s into 200s. Photos stored in /public are served from there.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const waitSeconds = await getRateLimitWait('photoDownload');
  if (waitSeconds > 0) {
    return new Response(rateLimitMessage('photoDownload', waitSeconds), {
      status: 429,
      headers: { 'Retry-After': String(waitSeconds), 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const { id } = await params;
  const item = await prisma.galleryItem.findFirst({
    where: { id, ...visibleGalleryItem },
    select: { id: true, src: true, takenAt: true },
  });
  if (!item) return new Response('No encontrado', { status: 404 });

  const fileName = photoFileName(item);

  if (isSignedGallerySrc(item.src)) {
    const url = await getPresignedDownloadUrl(item.src.slice(CLOUDFRONT_URL.length + 1), fileName);
    return NextResponse.json({ url }, { headers: { 'Cache-Control': 'private, no-store' } });
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
