import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signPhotoSrc } from '@/lib/photo-signing';
import { consumeIpRateLimit } from '@/lib/rate-limit';

// The image of a gallery photo (`?size=thumb|full`): rate limited per IP, then redirected to a
// signed CloudFront URL that expires within two hours.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const waitSeconds = await consumeIpRateLimit('photoView');
  if (waitSeconds > 0) {
    return new Response('Demasiadas solicitudes', {
      status: 429,
      headers: { 'Retry-After': String(waitSeconds) },
    });
  }

  const { id } = await params;
  const photo = await prisma.photo.findUnique({
    where: { id },
    select: { src: true, thumbSrc: true },
  });
  if (!photo) return new Response('Foto no encontrada', { status: 404 });

  const size = new URL(request.url).searchParams.get('size') === 'full' ? 'full' : 'thumb';
  const { url, expiresAt } = signPhotoSrc(size === 'full' ? photo.src : photo.thumbSrc);

  // The browser reuses the redirect while the signed URL is still valid.
  const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000) - 60);
  const response = NextResponse.redirect(new URL(url, request.url), 302);
  response.headers.set('Cache-Control', `private, max-age=${maxAge}`);
  return response;
}
