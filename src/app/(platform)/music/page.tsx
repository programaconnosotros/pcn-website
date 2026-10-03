import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { externalPlaylists, radios, type MusicSet } from '@/components/music/music-sets';
import { MusicGrid } from '@/components/music/music-grid';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'mpv ~/music',
  description: 'Radios de la comunidad y playlists recomendadas para programar concentrado.',
  openGraph: {
    title: 'Música | programaConNosotros',
    description: 'Radios de la comunidad y playlists recomendadas para programar concentrado.',
    url: `${SITE_URL}/music`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Música | programaConNosotros',
    description: 'Radios de la comunidad y playlists recomendadas para programar concentrado.',
  },
};

const MusicSection = ({ label, sets }: { label: string; sets: MusicSet[] }) => (
  <section className="mb-8">
    <h2 className="mb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-pcnGreen">
      <span className="text-pcnGreen-500">{'// '}</span>
      {label}
    </h2>
    <MusicGrid sets={sets} />
  </section>
);

const Music = () => (
  <div className="flex flex-1 flex-col p-4 pt-0">
    <StickyHeader className="mt-4">
      <PageTitle
        path="musica"
        meta={`${radios.length + externalPlaylists.length} sets para programar`}
      />
    </StickyHeader>
    <div className="mb-6">
      <MusicSection label="radios de la comunidad" sets={radios} />
      <MusicSection label="playlists externas recomendadas" sets={externalPlaylists} />
    </div>
  </div>
);

export default Music;
