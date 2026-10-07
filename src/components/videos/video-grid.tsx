'use client';

import { createContext, Fragment, useContext, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Eye, Play } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { MarkToggle } from '@/components/ui/mark-toggle';
import { CollapsibleFilters } from '@/components/ui/collapsible-filters';
import { SearchBar } from '@/components/ui/search-bar';
import {
  LanguageFilter,
  matchesLanguage,
  type LanguageFilterValue,
} from '@/components/ui/language-filter';
import { useContentMarks } from '@/hooks/use-content-marks';
import { normalizeSearchText } from '@/lib/search/search-index';
import { cn } from '@/lib/utils';
import { videoSpeakers, type Video } from './videos';

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  });

const byline = (video: Video) =>
  video.speaker ? `${video.speaker} · ${video.channel}` : video.channel;

/** Video speakers who are platform users (linked in /vinculos), by the name the video credits. */
export type SpeakerProfiles = Record<string, { id: string; name: string }>;

const SpeakerProfilesContext = createContext<SpeakerProfiles>({});

/** The byline, with the speakers who are platform users linked to their profiles. */
const Byline = ({ video }: { video: Video }) => {
  const profiles = useContext(SpeakerProfilesContext);
  const speakers = videoSpeakers(video);
  if (!speakers.some((name) => profiles[name])) return <>{byline(video)}</>;
  return (
    <>
      {speakers.map((name, index) => (
        <Fragment key={name}>
          {index > 0 && ', '}
          {profiles[name] ? (
            <Link
              href={`/perfil/${profiles[name].id}`}
              onClick={(event) => event.stopPropagation()}
              className="relative z-10 text-pcnGreen-700 underline-offset-2 hover:text-pcnGreen hover:underline"
            >
              {name}
            </Link>
          ) : (
            name
          )}
        </Fragment>
      ))}
      {' · '}
      {video.channel}
    </>
  );
};

const WATCH_FILTERS = [
  { value: 'todos', label: 'todos' },
  { value: 'sin-ver', label: 'sin ver' },
  { value: 'vistos', label: 'vistos' },
] as const;

type WatchFilter = (typeof WATCH_FILTERS)[number]['value'];

/**
 * Hides the videos that would leave the last row half empty at the grid's column count (two
 * columns from `sm`, three from `lg`), so a short preview always fills its rows.
 */
export const fillRowsClassName = (index: number, total: number) =>
  cn(
    index >= Math.floor(total / 2) * 2 && 'sm:max-lg:hidden',
    index >= Math.floor(total / 3) * 3 && 'lg:hidden',
  );

const VideoCell = ({
  video,
  onPlay,
  watched,
  onToggleWatched,
  className,
}: {
  video: Video;
  onPlay: () => void;
  watched: boolean;
  onToggleWatched: () => void;
  className?: string;
}) => (
  <div className={cn(ruledCellClassName, 'group relative flex flex-col gap-2 p-3', className)}>
    <span className="relative block aspect-video overflow-hidden rounded-sm border border-pcnGreen-200 bg-black transition-colors group-hover:border-pcnGreen-500">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        className={cn(
          'size-full object-cover transition-[opacity,transform,filter] duration-300 group-hover:scale-[1.03] group-hover:opacity-100 group-hover:[filter:none]',
          watched ? 'opacity-50 [filter:grayscale(0.8)]' : 'opacity-80',
        )}
      />
      <span className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.18)_0_1px,transparent_1px_3px)]" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex size-9 items-center justify-center rounded-sm border border-pcnGreen-500 bg-black/70 text-pcnGreen opacity-0 shadow-[0_0_18px_-4px_rgba(4,244,190,0.8)] transition-opacity duration-200 group-hover:opacity-100">
          <Play className="size-4 fill-current" />
        </span>
      </span>
      {watched && (
        <span className="absolute left-1.5 top-1.5 flex items-center gap-1 bg-pcnGreen px-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-black shadow-[0_0_10px_rgba(4,244,190,0.7)]">
          <Eye className="size-3" />
          visto
        </span>
      )}
      <span className="absolute bottom-1.5 right-1.5 bg-black/80 px-1 font-mono text-[10px] tabular-nums text-pcnGreen">
        {formatDuration(video.durationSeconds)}
      </span>
    </span>

    {/* The title's button stretches over the whole cell so any click plays the video. */}
    <span className="flex items-start gap-2 font-mono text-xs">
      <button
        type="button"
        onClick={onPlay}
        className="line-clamp-2 flex-1 text-left font-semibold leading-snug after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-1 focus-visible:after:ring-inset focus-visible:after:ring-pcnGreen group-hover:text-pcnGreen"
      >
        {video.title}
      </button>
      <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
        {formatDate(video.date)}
      </span>
    </span>
    <span className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground/70">
      <span className="min-w-0 flex-1 truncate">
        <span className="text-pcnGreen-500">@ </span>
        <Byline video={video} />
      </span>
      <MarkToggle
        active={watched}
        onToggle={onToggleWatched}
        icon={Eye}
        label="visto"
        title={watched ? 'Desmarcar como visto' : 'Marcar como visto'}
      />
    </span>
  </div>
);

/** YouTube videos laid out on the ruled grid; each one plays in a dialog without leaving the page. */
export function VideoGrid({
  videos,
  toolbar = true,
  searchable = false,
  fillRows = false,
  speakerProfiles = {},
}: {
  videos: Video[];
  /** Speakers who are platform users, linked to their profiles in the bylines. */
  speakerProfiles?: SpeakerProfiles;
  /** For short previews: leave out what would sit alone in a half-empty last row. */
  fillRows?: boolean;
  /** Shows the watch progress and the watched/unwatched filter above the grid. */
  toolbar?: boolean;
  /** Adds a search box that filters by title, speaker, channel (the event, for talks) or year. */
  searchable?: boolean;
}) {
  const [playing, setPlaying] = useState<Video | null>(null);
  const [filter, setFilter] = useState<WatchFilter>('todos');
  const [language, setLanguage] = useState<LanguageFilterValue>('todos');
  const [query, setQuery] = useState('');
  const needle = normalizeSearchText(query).trim();
  const marks = useContentMarks('video');
  const watchedIds = marks.ids('watched');
  const watchedCount = videos.filter((video) => watchedIds.has(video.id)).length;
  const visibleVideos = videos.filter(
    (video) =>
      matchesLanguage(video.language, language) &&
      (!needle ||
        normalizeSearchText(
          [video.title, video.speaker, video.channel, video.date.slice(0, 4)].join(' '),
        ).includes(needle)) &&
      (filter === 'todos' || (filter === 'vistos') === watchedIds.has(video.id)),
  );
  const barWidth = 16;
  const filled = Math.round((watchedCount / Math.max(videos.length, 1)) * barWidth);

  return (
    <SpeakerProfilesContext.Provider value={speakerProfiles}>
      {/* Watch progress, the language filter and the watched/unwatched filter. */}
      {toolbar && (
        <CollapsibleFilters
          className="border border-b-0 border-pcnGreen-200 bg-black/60 px-3 py-2 font-mono text-[11px] md:gap-x-4"
          panelClassName="md:flex-1 md:gap-x-4"
          activeCount={Number(language !== 'todos') + Number(filter !== 'todos')}
          search={
            searchable && (
              <SearchBar
                searchQuery={query}
                setSearchQuery={setQuery}
                placeholder="título, speaker, evento o canal"
                label="Buscar por título, speaker, evento o canal"
                className="h-8 max-w-sm flex-1 basis-full sm:basis-auto"
              />
            )
          }
        >
          <span className="flex items-center gap-2 text-muted-foreground">
            vistos
            <span aria-hidden className="tracking-[-0.05em]">
              <span className="text-glow text-pcnGreen">{'█'.repeat(filled)}</span>
              <span className="text-pcnGreen-200">{'░'.repeat(barWidth - filled)}</span>
            </span>
            <span className="tabular-nums text-pcnGreen">
              {watchedCount}/{videos.length}
            </span>
            {!marks.isAuthenticated && !marks.isLoading && (
              <span className="text-muted-foreground/70 max-sm:hidden">
                · iniciá sesión para guardar lo que ves
              </span>
            )}
          </span>
          <LanguageFilter value={language} onChange={setLanguage} className="ml-auto" />
          <span
            className="flex h-8 border border-pcnGreen-200"
            role="group"
            aria-label="Filtrar por estado"
          >
            {WATCH_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={cn(
                  'border-r border-pcnGreen-200 px-2 transition-colors last:border-r-0',
                  filter === value
                    ? 'bg-pcnGreen text-black'
                    : 'text-muted-foreground hover:bg-pcnGreen/[0.06] hover:text-pcnGreen',
                )}
              >
                {label}
              </button>
            ))}
          </span>
        </CollapsibleFilters>
      )}

      {visibleVideos.length === 0 && (
        <p className="border border-dashed border-pcnGreen-200 py-8 text-center font-mono text-sm text-muted-foreground">
          <span className="text-pcnGreen">404</span> ·{' '}
          {needle
            ? 'ningún video coincide con la búsqueda'
            : filter === 'vistos'
              ? 'todavía no marcaste ningún video como visto'
              : filter === 'sin-ver'
                ? '¡ya viste todo!'
                : 'no hay videos en ese idioma'}
        </p>
      )}

      <RuledGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {visibleVideos.map((video, index) => (
          <VideoCell
            key={video.id}
            className={fillRows ? fillRowsClassName(index, visibleVideos.length) : undefined}
            video={video}
            onPlay={() => setPlaying(video)}
            watched={watchedIds.has(video.id)}
            onToggleWatched={() => marks.toggle(video.id, 'watched')}
          />
        ))}
      </RuledGrid>

      <Dialog open={!!playing} onOpenChange={(open) => !open && setPlaying(null)}>
        {playing && (
          <DialogContent className="flex w-[min(94vw,calc((100dvh_-_7.5rem)*16/9))] max-w-5xl flex-col gap-0 overflow-hidden rounded-sm border border-pcnGreen-300 bg-black p-0 [&>button:last-child]:top-2.5">
            <header className="flex items-center gap-3 border-b border-pcnGreen-200 py-2 pl-3 pr-12 font-mono">
              <div className="min-w-0 flex-1">
                <DialogTitle className="truncate text-sm font-semibold">
                  {playing.title}
                </DialogTitle>
                <DialogDescription className="truncate text-[11px] text-pcnGreen-600">
                  <span className="text-pcnGreen-500">@ </span>
                  <Byline video={playing} /> · {formatDate(playing.date)}
                </DialogDescription>
              </div>
              <MarkToggle
                active={watchedIds.has(playing.id)}
                onToggle={() => marks.toggle(playing.id, 'watched')}
                icon={Eye}
                label="visto"
                title={watchedIds.has(playing.id) ? 'Desmarcar como visto' : 'Marcar como visto'}
                className="py-1"
              />
              <a
                href={`https://www.youtube.com/watch?v=${playing.id}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Ver en YouTube"
                className="flex shrink-0 items-center gap-1 rounded-sm border border-pcnGreen-200 px-2 py-1 text-[11px] text-pcnGreen-700 transition-colors hover:border-pcnGreen-500 hover:text-pcnGreen"
              >
                <span className="max-sm:hidden">youtube</span>
                <ArrowUpRight className="size-3.5" />
              </a>
            </header>
            <iframe
              key={playing.id}
              src={`https://www.youtube-nocookie.com/embed/${playing.id}?autoplay=1&rel=0`}
              title={playing.title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="aspect-video w-full border-0"
            />
          </DialogContent>
        )}
      </Dialog>
    </SpeakerProfilesContext.Provider>
  );
}
