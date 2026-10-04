import { safeFetch } from '@/lib/safe-fetch';

const MAX_REDIRECTS = 3;

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

/**
 * Fetches `url` and tells whether it can be shown in an iframe of its original site. The URL is
 * user-entered, so it goes through `safeFetch`: every hop, redirects included, must connect to a
 * public address, checked on the same DNS answer the socket uses.
 */
export const isEmbeddable = async (url: string) => {
  try {
    // Only the headers matter; the body is never downloaded.
    const response = await safeFetch(url, { maxRedirects: MAX_REDIRECTS });
    return response.ok && allowsFraming(response.headers);
  } catch {
    return false;
  }
};

export const EMBED_CACHE_HEADERS = {
  'Cache-Control': 's-maxage=86400, stale-while-revalidate=3600',
};
