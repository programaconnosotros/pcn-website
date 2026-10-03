// Events store the Google Maps link an organizer pasted. Everything map-related (the embedded
// map, the "abrir en Google Maps" links) derives from that one URL.

const GOOGLE_HOST = /^(www\.)?google\.[a-z]{2,3}(\.[a-z]{2})?$/i;
const MAPS_GOOGLE_HOST = /^maps\.google\.[a-z]{2,3}(\.[a-z]{2})?$/i;
const SHORT_HOST = /^maps\.app\.goo\.gl$/i;
const GOO_GL_HOST = /^goo\.gl$/i;

const parseUrl = (value: string): URL | null => {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
  } catch {
    return null;
  }
};

/** True for google.com/maps, maps.google.*, maps.app.goo.gl and goo.gl/maps links. */
export function isGoogleMapsUrl(value: string): boolean {
  const url = parseUrl(value);
  if (!url) return false;
  const host = url.hostname;
  if (MAPS_GOOGLE_HOST.test(host) || SHORT_HOST.test(host)) return true;
  if (GOOGLE_HOST.test(host)) return url.pathname === '/maps' || url.pathname.startsWith('/maps/');
  if (GOO_GL_HOST.test(host)) return url.pathname.startsWith('/maps/');
  return false;
}

const decodeSegment = (segment: string) => {
  try {
    return decodeURIComponent(segment.replace(/\+/g, ' ')).trim();
  } catch {
    return segment.trim();
  }
};

const COORDS = String.raw`(-?\d{1,3}(?:\.\d+)?)`;

/**
 * What to search for on the map, read from a full Google Maps link: a pin's exact coordinates,
 * a `q`/`query` parameter, a place name or the viewport centre. Short links (maps.app.goo.gl)
 * only resolve through a redirect, so they return null and callers fall back to the address.
 */
export function googleMapsQuery(value: string): string | null {
  if (!isGoogleMapsUrl(value)) return null;
  const url = parseUrl(value)!;
  if (SHORT_HOST.test(url.hostname) || GOO_GL_HOST.test(url.hostname)) return null;

  // The pin of a shared place: ".../data=!3d-26.84!4d-65.22".
  const pin = url.pathname.match(new RegExp(`!3d${COORDS}!4d${COORDS}`));
  if (pin) return `${pin[1]},${pin[2]}`;

  for (const param of ['q', 'query', 'daddr', 'destination']) {
    const text = url.searchParams.get(param)?.trim();
    if (text) return text;
  }

  const place = url.pathname.match(/\/maps\/(?:place|search)\/([^/]+)/);
  if (place) {
    const text = decodeSegment(place[1]);
    if (text && !text.startsWith('@')) return text;
  }

  const centre = url.pathname.match(new RegExp(`@${COORDS},${COORDS}`));
  if (centre) return `${centre[1]},${centre[2]}`;

  const ll = url.searchParams.get('ll')?.trim();
  if (ll) return ll;

  return null;
}

/**
 * The `output=embed` URL for an iframe showing the event's spot. Uses what the Maps link says
 * and, when it can't be read (short links), the venue/address the event was saved with.
 */
export function googleMapsEmbedUrl(
  mapsUrl: string | null | undefined,
  fallbackQuery?: string | null,
): string | null {
  const query = (mapsUrl && googleMapsQuery(mapsUrl)) || fallbackQuery?.trim();
  if (!query) return null;
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
}

/** A Google Maps search for a free-text location, for events saved without a Maps link. */
export function googleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
