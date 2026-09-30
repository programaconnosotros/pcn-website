import { PageTitle } from '@/components/ui/page-title';
import { externalPlaylists, radios, type MusicSet } from '@/components/music/music-sets';
import { MusicGrid } from './music-grid';

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
    <PageTitle
      path="musica"
      className="mt-4"
      meta={`${radios.length + externalPlaylists.length} sets para programar`}
    />
    <div className="mb-6">
      <MusicSection label="radios de la comunidad" sets={radios} />
      <MusicSection label="playlists externas recomendadas" sets={externalPlaylists} />
    </div>
  </div>
);

export default Music;
