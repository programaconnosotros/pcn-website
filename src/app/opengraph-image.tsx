import { OG_CONTENT_TYPE, OG_SIZE } from '@/lib/og/terminal-card';
import { renderSectionCard, sectionCardAlt } from '@/lib/og/section-cards';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = sectionCardAlt('inicio');

// Default link preview for every page without a card of its own (auth pages, admin pages...).
export default function Image() {
  return renderSectionCard('inicio');
}
