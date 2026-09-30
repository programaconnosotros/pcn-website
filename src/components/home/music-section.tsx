import { Eyebrow, SectionHeader } from '@/components/home/section-header';
import { MusicGrid } from '@/components/music/music-grid';
import { externalPlaylists, radios } from '@/components/music/music-sets';

/** The community's own radios and the playlists it recommends, playable in place. */
export const MusicSection = () => (
  <section>
    <SectionHeader
      eyebrow="música"
      title="Música para programar"
      description="Playlists creadas por la comunidad y otras que recomendamos para momentos de focus y de relax."
      action={{ label: 'Ver toda la música', href: '/music' }}
    />
    <div className="flex flex-col gap-6">
      <div>
        <Eyebrow className="mb-2">creadas por la comunidad</Eyebrow>
        <MusicGrid sets={radios} />
      </div>
      <div>
        <Eyebrow className="mb-2">recomendadas para focus y relax</Eyebrow>
        <MusicGrid sets={externalPlaylists} />
      </div>
    </div>
  </section>
);
