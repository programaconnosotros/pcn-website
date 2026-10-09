import type { Metadata } from 'next';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { RuledGrid } from '@/components/ui/ruled-grid';
import { technologyTimelines } from '@/data/opiniones-tecnologia';
import { tabTitle } from '@/lib/tab-title';
import { OpinionTimeline, StanceStrip } from './opinion-timeline';
import { OPINIONS_SHARE_DESCRIPTION, OPINIONS_SHARE_TITLE } from './share';

const DESCRIPTION =
  'Cómo cambió lo que piensa el grupo de cada tecnología: una línea de tiempo armada a partir de sus conversaciones.';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

// Its own preview: without it the link inherits the conversations page's title and card. The
// image comes from opengraph-image.tsx / twitter-image.tsx in this folder.
export const metadata: Metadata = {
  title: tabTitle.ls('conversaciones/opiniones'),
  description: DESCRIPTION,
  openGraph: {
    title: `${OPINIONS_SHARE_TITLE} | programaConNosotros`,
    description: OPINIONS_SHARE_DESCRIPTION,
    url: `${SITE_URL}/conversaciones/opiniones`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${OPINIONS_SHARE_TITLE} | programaConNosotros`,
    description: OPINIONS_SHARE_DESCRIPTION,
  },
};

// /conversaciones/opiniones: one timeline per technology the group keeps coming back to.
export default function OpinionsPage() {
  const timelines = technologyTimelines.filter(({ opinions }) => opinions.length > 0);
  const total = timelines.reduce((sum, { opinions }) => sum + opinions.length, 0);

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <StickyHeader>
          <PageTitle
            path={[{ label: 'conversaciones', href: '/conversaciones' }, { label: 'opiniones' }]}
            meta={`${timelines.length} tecnologías · ${total} momentos · lo que opinó el grupo`}
          />
        </StickyHeader>

        <p className="mb-4 max-w-3xl text-sm text-muted-foreground">{DESCRIPTION}</p>

        <nav aria-label="Tecnologías" className="mb-8 flex flex-wrap gap-1.5 font-mono text-xs">
          {timelines.map(({ slug, name, opinions }) => (
            <a
              key={slug}
              href={`#${slug}`}
              className="flex items-center gap-2 border border-pcnGreen-200 px-2 py-1 text-muted-foreground transition-colors hover:border-pcnGreen-600 hover:text-pcnGreen hover:box-glow focus-visible:border-pcnGreen-600 focus-visible:text-pcnGreen focus-visible:box-glow focus-visible:outline-none"
            >
              {name}
              <StanceStrip stances={opinions.map(({ stance }) => stance)} />
            </a>
          ))}
        </nav>

        <RuledGrid className="mb-14 xl:grid-cols-2">
          {timelines.map((timeline) => (
            <OpinionTimeline key={timeline.slug} {...timeline} />
          ))}
        </RuledGrid>
      </div>
    </div>
  );
}
