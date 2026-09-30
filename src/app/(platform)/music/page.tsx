import { PageTitle } from '@/components/ui/page-title';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';

interface MusicSet {
  /** YouTube video id. */
  id: string;
  title: string;
  channel: string;
}

// The community's own live radios.
const radios: MusicSet[] = [
  { id: '1vsUPluzAWo', title: 'Chill synthwave radio', channel: 'programaConNosotros' },
  { id: 'SpNIOu8LAFo', title: 'Dark synthwave radio', channel: 'programaConNosotros' },
  { id: 'sd9AbVNlgi4', title: 'Chill lofi & jazz hop radio', channel: 'programaConNosotros' },
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
    <RuledGrid className="grid-cols-1 md:grid-cols-3">
      {sets.map((set) => (
        <div key={set.id} className={cn(ruledCellClassName, 'flex flex-col gap-2 p-2')}>
          <div className="aspect-video w-full overflow-hidden">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${set.id}`}
              title={set.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          <p className="truncate px-1 font-mono text-xs font-semibold">{set.title}</p>
          <p className="-mt-1.5 truncate px-1 font-mono text-[11px] text-muted-foreground/70">
            <span className="text-pcnGreen-500">@ </span>
            {set.channel}
          </p>
        </div>
      ))}
    </RuledGrid>
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
