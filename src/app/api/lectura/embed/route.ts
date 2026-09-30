import { NextResponse } from 'next/server';
import { articles } from '@/app/(platform)/lectura/articles';

export const runtime = 'nodejs';

const allowedUrls = new Set(articles.map((a) => a.url));

/**
 * Whether the response headers let any other site show the page in an iframe. Sites opt out
 * with `X-Frame-Options` or a CSP `frame-ancestors` directive that does not allow everyone.
 */
const allowsFraming = (headers: Headers) => {
  if (headers.get('x-frame-options')) return false;
  const frameAncestors = headers
    .get('content-security-policy')
    ?.split(';')
    .map((directive) => directive.trim())
    .find((directive) => directive.toLowerCase().startsWith('frame-ancestors'));
  if (!frameAncestors) return true;
  return frameAncestors.split(/\s+/).slice(1).includes('*');
};

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

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(10_000),
    });
    // Only the headers matter; don't download the page.
    await response.body?.cancel();

    return NextResponse.json(
      { embeddable: response.ok && allowsFraming(response.headers) },
      { headers: { 'Cache-Control': 's-maxage=86400, stale-while-revalidate=3600' } },
    );
  } catch {
    return NextResponse.json({ embeddable: false });
  }
}
