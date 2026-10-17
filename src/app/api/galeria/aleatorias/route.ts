import { NextResponse } from 'next/server';
import { listRandomGalleryPhotos } from '@/lib/gallery';

const SAMPLE_SIZE = 40;

// A random sample of uploaded gallery photos, with signed thumbnail URLs, for the photos
// widget on the PCN OS desktop. Not cached: each request draws a new sample.
export async function GET() {
  const photos = await listRandomGalleryPhotos(SAMPLE_SIZE);
  return NextResponse.json({ photos }, { headers: { 'Cache-Control': 'private, no-store' } });
}
