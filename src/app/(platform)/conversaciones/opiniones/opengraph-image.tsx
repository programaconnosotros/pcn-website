import { technologyTimelines } from '@/data/opiniones-tecnologia';
import { OG_CONTENT_TYPE, OG_SIZE, renderTerminalCard } from '@/lib/og/terminal-card';
import { OPINIONS_SHARE_DESCRIPTION, OPINIONS_SHARE_TITLE } from './share';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = `${OPINIONS_SHARE_TITLE} · programaConNosotros`;

// Its own card, so a shared link doesn't look like the conversations page.
export default function Image() {
  const timelines = technologyTimelines.filter(({ opinions }) => opinions.length > 0);
  const moments = timelines.reduce((sum, { opinions }) => sum + opinions.length, 0);
  return renderTerminalCard({
    path: 'conversaciones/opiniones',
    command: 'git log --follow -- opiniones/',
    title: OPINIONS_SHARE_TITLE,
    description: OPINIONS_SHARE_DESCRIPTION,
    meta: [`${timelines.length} tecnologías`, `${moments} momentos`],
  });
}
