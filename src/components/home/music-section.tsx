import { SectionHeader } from '@/components/home/section-header';
import { MusicGrid } from '@/components/music/music-grid';
import { radios } from '@/components/music/music-sets';

/** The community's own radios, playable in place. */
export const MusicSection = () => (
  <section>
    <SectionHeader
      eyebrow="música"
      title="Música para programar"
      description="Playlists creadas por la comunidad para momentos de focus y de relax."
      action={{ label: 'Ver toda la música', href: '/music' }}
    />
    <MusicGrid sets={radios} />
  </section>
);
