import { NextResponse } from 'next/server';
import { articles } from '@/app/(platform)/lectura/articles';
import { EMBED_CACHE_HEADERS, isEmbeddable } from '@/lib/embeddable';

export const runtime = 'nodejs';

const allowedUrls = new Set(articles.map((a) => a.url));

/** Tells the reading page whether an article can be shown in an iframe of its original site. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // SSRF guard: only allow URLs present in the articles data
  if (!allowedUrls.has(url)) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 400 });
  }

  return NextResponse.json(
    { embeddable: await isEmbeddable(url) },
    { headers: EMBED_CACHE_HEADERS },
  );
}
