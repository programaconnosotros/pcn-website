import { PageTitle } from '@/components/ui/page-title';
import { MusicGrid, type MusicSet } from './music-grid';

// The community's own live radios.
const radios: MusicSet[] = [
  { id: '1vsUPluzAWo', title: 'Chill synthwave radio', channel: 'programaConNosotros', live: true },
  { id: 'SpNIOu8LAFo', title: 'Dark synthwave radio', channel: 'programaConNosotros', live: true },
  {
    id: 'sd9AbVNlgi4',
    title: 'Chill lofi & jazz hop radio',
    channel: 'programaConNosotros',
    live: true,
  },
];

// Playlists from other channels that the community recommends for focusing.
const externalPlaylists: MusicSet[] = [
  {
    id: 'FejAQVk1NmU',
    title: 'this playlist will make you dangerously focused',
    channel: 'LOUNGE FOCUS',
  },
  {
    id: 'eE28XvrG0lM',
    title: 'this playlist will make you dangerously unstoppable',
    channel: 'LOUNGE FOCUS',
  },
  {
    id: 'MB6Fw9pp3g0',
    title: 'this playlist will make you dangerously focused',
    channel: 'LOUNGE FOCUS',
  },
];

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
