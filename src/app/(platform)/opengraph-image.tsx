import { OG_CONTENT_TYPE, OG_SIZE } from '@/lib/og/terminal-card';
import { renderSectionCard, sectionCardAlt } from '@/lib/og/section-cards';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = sectionCardAlt('inicio');

// The landing page. `app/opengraph-image.tsx` renders the same card as the default for pages
// without their own, but the landing page's `openGraph` metadata replaces that inherited image,
// so it needs a card in its own segment.
export default function Image() {
  return renderSectionCard('inicio');
}
