import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

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

// Loopback, private, link-local (cloud metadata), CGNAT and unspecified ranges.
const isPrivateAddress = (address: string) => {
  if (isIP(address) === 6) {
    const lower = address.toLowerCase();
    if (lower.startsWith('::ffff:')) return isPrivateAddress(lower.slice(7));
    return (
      lower === '::' ||
      lower === '::1' ||
      lower.startsWith('fc') ||
      lower.startsWith('fd') ||
      lower.startsWith('fe80')
    );
  }
  const [a, b] = address.split('.').map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
};

/** True for http(s) URLs whose host resolves only to public addresses. */
const isPublicUrl = async (url: URL) => {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
  const host = url.hostname.replace(/^\[|\]$/g, '');
  try {
    const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
    return addresses.length > 0 && addresses.every(({ address }) => !isPrivateAddress(address));
  } catch {
    return false;
  }
};

/**
 * Fetches `url` and tells whether it can be shown in an iframe of its original site. Every hop,
 * redirects included, must point to a public address, so user-entered URLs can't reach the
 * server's internal network.
 */
export const isEmbeddable = async (url: string) => {
  try {
    let current = new URL(url);
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      if (!(await isPublicUrl(current))) return false;
      const response = await fetch(current, {
        redirect: 'manual',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(10_000),
      });
      // Only the headers matter; don't download the page.
      await response.body?.cancel();

      const location = response.headers.get('location');
      if (response.status >= 300 && response.status < 400 && location) {
        current = new URL(location, current);
        continue;
      }
      return response.ok && allowsFraming(response.headers);
    }
    return false;
  } catch {
    return false;
  }
};

export const EMBED_CACHE_HEADERS = {
  'Cache-Control': 's-maxage=86400, stale-while-revalidate=3600',
};
