const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

/**
 * Wraps an image URL through Next.js' image optimizer so social-media scrapers
 * receive a small, recompressed JPEG/PNG instead of the multi-MB original.
 *
 * Raw event flyers are typically 4–5 MB. WhatsApp silently drops link previews
 * for images over ~600 KB–1 MB; Twitter/X caps at 5 MB. When the og:image is
 * rejected the platform falls back to scanning the page and picks up the on-page
 * PCN logo — which is why previews showed the logo instead of the flyer.
 *
 * The optimizer returns the original format (JPEG/PNG) rather than WebP because
 * scrapers don't send `Accept: image/webp`, so the output is universally
 * compatible. Returns an absolute URL as required by og:image.
 *
 * Pinned values are Next 16-safe:
 *  - w=1200 is in the default `deviceSizes`
 *  - q=75 is the default allowed quality (Next 16 rejects non-allowlisted values)
 */
export function optimizedOgImage(src: string, { width = 1200, quality = 75 } = {}): string {
  const optimized = `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
  return new URL(optimized, SITE_URL).toString();
}
