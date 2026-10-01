'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Edit,
  FileText,
  Images,
  MapPin,
  MoreVertical,
  Play,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { SearchBar } from '@/components/ui/search-bar';
import { cn } from '@/lib/utils';
import { parallaxStyle, useParallax } from '@/components/photo-gallery/use-parallax';
import type { fetchPublicTalks } from '@/actions/talks/fetch-public-talks';

export type TalkWithEvent = Awaited<ReturnType<typeof fetchPublicTalks>>[number];

const FILTERS = [
  { value: 'todas', label: 'todas' },
  { value: 'video', label: 'con video' },
  { value: 'slides', label: 'con slides' },
] as const;

type Filter = (typeof FILTERS)[number]['value'];

const youtubeId = (url: string | null) =>
  url?.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/)?.[1] ?? null;

const talkDate = (talk: TalkWithEvent) => {
  const date = talk.event?.date ?? talk.manualEventDate;
  return date ? new Date(date) : null;
};

const formatDate = (date: Date) =>
  date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

const talkLocation = (talk: TalkWithEvent) =>
  talk.event
    ? talk.event.isOnline
      ? 'online'
      : [talk.event.placeName, talk.event.city].filter(Boolean).join(', ')
    : talk.manualEventLocation ?? '';

const hasSlides = (talk: TalkWithEvent) => talk.slideImages.length > 0 || !!talk.slidesUrl;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');

// Cover for talks without a portrait or video: the title's initials over a dotted grid.
const Placeholder = ({ title }: { title: string }) => (
  <span className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle,rgba(4,244,190,0.18)_1px,transparent_1px)] bg-[length:12px_12px]">
    <span className="text-glow font-mono text-4xl font-bold tracking-tighter text-pcnGreen/80">
      {initials(title)}
      <span className="animate-blink">_</span>
    </span>
  </span>
);

interface TalkCellProps {
  talk: TalkWithEvent;
  index: number;
  isAdmin: boolean;
  onPlay: () => void;
  onSlides: () => void;
  /** Only reachable from the admin menu, so cells shown to everyone can leave them out. */
  onEdit?: () => void;
  onDelete?: () => void;
}

const coverClassName =
  'size-full brightness-[0.8] saturate-[0.7] transition duration-500 ease-out group-hover:brightness-100 group-hover:saturate-100 group-focus-within:brightness-100 group-focus-within:saturate-100';

const cornerClassName =
  'pointer-events-none absolute size-3 border-pcnGreen opacity-0 transition-all duration-300 group-hover:opacity-100 group-focus-within:opacity-100';

const linkClass =
  'relative z-10 inline-flex items-center gap-1 rounded-sm border border-pcnGreen-200 px-1.5 py-0.5 font-mono text-[10px] text-pcnGreen-700 transition-colors hover:border-pcnGreen-500 hover:text-pcnGreen';

export const TalkCell = ({
  talk,
  index,
  isAdmin,
  onPlay,
  onSlides,
  onEdit,
  onDelete,
}: TalkCellProps) => {
  const videoId = youtubeId(talk.videoUrl);
  const date = talkDate(talk);
  const location = talkLocation(talk);
  const eventTitle = talk.event?.name ?? talk.manualEventTitle;
  const avatars = talk.speakers.filter((speaker) => speaker.user?.image);
  // Videos that aren't on YouTube can't be embedded, so they open in a new tab instead.
  const primaryAction = videoId ? onPlay : talk.slideImages.length > 0 ? onSlides : null;
  const frameRef = useRef<HTMLSpanElement>(null);
  useParallax(frameRef);

  return (
    <article className={cn(ruledCellClassName, 'group relative flex flex-col gap-2.5 p-3')}>
      {/* Same window as the gallery photos: a dimmed, scanlined cover that powers up on hover, with
          lit corner brackets and an oversized layer drifting with the scroll and the pointer. */}
      <span
        ref={frameRef}
        className="relative block aspect-square overflow-hidden rounded-sm border border-pcnGreen-200 bg-black transition-colors group-hover:border-pcnGreen-500"
      >
        <span
          aria-hidden
          style={parallaxStyle}
          className="absolute inset-x-0 -top-[12%] block h-[124%] transition-transform duration-150 ease-out will-change-transform"
        >
          {talk.portraitUrl ? (
            // Portraits are square flyers with their own text, so they're shown whole.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={talk.portraitUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className={cn(coverClassName, 'object-contain group-hover:scale-[1.04]')}
            />
          ) : videoId ? (
            // hqdefault is 4:3 with letterbox bars baked in; the scale crops them off.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              decoding="async"
              className={cn(coverClassName, 'scale-[1.34] object-cover group-hover:scale-[1.4]')}
            />
          ) : (
            <Placeholder title={talk.title} />
          )}
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.22)_0_1px,transparent_1px_3px)] transition-opacity duration-500 group-hover:opacity-0"
        />

        <span className="absolute left-1.5 top-1.5 rounded-sm bg-black/70 px-1 font-mono text-[10px] tabular-nums text-pcnGreen-600 backdrop-blur-sm">
          #{String(index).padStart(3, '0')}
        </span>

        {videoId && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-10 items-center justify-center rounded-sm border border-pcnGreen-500 bg-black/70 text-pcnGreen opacity-0 shadow-[0_0_18px_-4px_rgba(4,244,190,0.8)] transition-all duration-200 group-hover:scale-110 group-hover:opacity-100">
              <Play className="size-4 fill-current" />
            </span>
          </span>
        )}

        <span aria-hidden className={cn(cornerClassName, 'left-1 top-1 border-l-2 border-t-2')} />
        <span aria-hidden className={cn(cornerClassName, 'right-1 top-1 border-r-2 border-t-2')} />
        <span
          aria-hidden
          className={cn(cornerClassName, 'bottom-1 left-1 border-b-2 border-l-2')}
        />
        <span
          aria-hidden
          className={cn(cornerClassName, 'bottom-1 right-1 border-b-2 border-r-2')}
        />
      </span>

      <div className="flex items-start gap-2">
        {primaryAction ? (
          // Stretches over the whole cell so any click plays the talk (links sit above it).
          <button
            type="button"
            onClick={primaryAction}
            className="line-clamp-2 flex-1 text-left font-mono text-sm font-semibold leading-snug after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-1 focus-visible:after:ring-inset focus-visible:after:ring-pcnGreen group-hover:text-pcnGreen"
          >
            {talk.title}
          </button>
        ) : (
          <h3 className="line-clamp-2 flex-1 font-mono text-sm font-semibold leading-snug">
            {talk.title}
          </h3>
        )}
        {isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative z-10 -mr-1 -mt-1 h-6 w-6">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex flex-col gap-0.5 font-mono text-[11px]">
        {talk.speakers.length > 0 && (
          <p className="flex items-center gap-1.5 truncate text-muted-foreground">
            {avatars.length > 0 ? (
              <span className="flex shrink-0 -space-x-1.5">
                {avatars.slice(0, 3).map((speaker) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={speaker.id}
                    src={speaker.user!.image!}
                    alt=""
                    className="size-4 rounded-full border border-pcnGreen-500 bg-black object-cover"
                  />
                ))}
              </span>
            ) : (
              <span className="text-pcnGreen-500">@</span>
            )}
            <span className="truncate">
              {talk.speakers.map((speaker, i) => (
                <span key={speaker.id}>
                  {i > 0 && ', '}
                  {speaker.user ? (
                    <Link
                      href={`/perfil/${speaker.user.id}`}
                      className="relative z-10 hover:text-pcnGreen hover:underline"
                    >
                      {speaker.speakerName}
                    </Link>
                  ) : (
                    speaker.speakerName
                  )}
                </span>
              ))}
            </span>
          </p>
        )}
        {eventTitle && (
          <p className="truncate text-muted-foreground/70">
            <span className="text-pcnGreen-500">$ </span>
            {talk.event?.id ? (
              <Link
                href={`/eventos/${talk.event.id}`}
                className="relative z-10 hover:text-pcnGreen hover:underline"
              >
                {eventTitle}
              </Link>
            ) : (
              eventTitle
            )}
          </p>
        )}
        {(date || location) && (
          <p className="flex items-center gap-1 truncate text-muted-foreground/60">
            {date && <span className="tabular-nums text-pcnGreen-600">{formatDate(date)}</span>}
            {date && location && <span>·</span>}
            {location && (
              <>
                <MapPin className="size-3 shrink-0 text-pcnGreen-500" />
                <span className="truncate">{location}</span>
              </>
            )}
          </p>
        )}
      </div>

      {(talk.videoUrl || hasSlides(talk)) && (
        <div className="mt-auto flex flex-wrap gap-1.5">
          {talk.videoUrl &&
            (videoId ? (
              <button type="button" onClick={onPlay} className={linkClass}>
                <Play className="size-3 fill-current" />
                video
              </button>
            ) : (
              <a
                href={talk.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                <Play className="size-3 fill-current" />
                video
                <ArrowUpRight className="size-3" />
              </a>
            ))}
          {talk.slideImages.length > 0 ? (
            <button type="button" onClick={onSlides} className={linkClass}>
              <Images className="size-3" />
              slides · {talk.slideImages.length}
            </button>
          ) : talk.slidesUrl ? (
            <a
              href={talk.slidesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              <FileText className="size-3" />
              slides
              <ArrowUpRight className="size-3" />
            </a>
          ) : null}
        </div>
      )}
    </article>
  );
};

interface TalkMediaDialogsProps {
  playing: TalkWithEvent | null;
  slides: TalkWithEvent | null;
  onClosePlaying: () => void;
  onCloseSlides: () => void;
}

/** The in-place YouTube player and slides carousel opened from a talk cell. */
export const TalkMediaDialogs = ({
  playing,
  slides,
  onClosePlaying,
  onCloseSlides,
}: TalkMediaDialogsProps) => {
  const playingId = youtubeId(playing?.videoUrl ?? null);

  return (
    <>
      <Dialog open={!!playing} onOpenChange={(open) => !open && onClosePlaying()}>
        {playing && playingId && (
          <DialogContent className="flex w-[min(94vw,calc((100dvh_-_7.5rem)*16/9))] max-w-5xl flex-col gap-0 overflow-hidden rounded-sm border border-pcnGreen-300 bg-black p-0 [&>button:last-child]:top-2.5">
            <header className="flex items-center gap-3 border-b border-pcnGreen-200 py-2 pl-3 pr-12 font-mono">
              <div className="min-w-0 flex-1">
                <DialogTitle className="truncate text-sm font-semibold">
                  {playing.title}
                </DialogTitle>
                <DialogDescription className="truncate text-[11px] text-pcnGreen-600">
                  <span className="text-pcnGreen-500">@ </span>
                  {playing.speakers.map((s) => s.speakerName).join(', ')}
                  {talkDate(playing) && ` · ${formatDate(talkDate(playing)!)}`}
                </DialogDescription>
              </div>
              <a
                href={playing.videoUrl!}
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
              key={playingId}
              src={`https://www.youtube-nocookie.com/embed/${playingId}?autoplay=1&rel=0`}
              title={playing.title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="aspect-video w-full border-0"
            />
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={!!slides} onOpenChange={(open) => !open && onCloseSlides()}>
        {slides && (
          <DialogContent className="max-w-4xl gap-3 rounded-sm border border-pcnGreen-300 bg-black px-16 font-mono">
            <DialogTitle className="text-sm font-semibold">{slides.title}</DialogTitle>
            <DialogDescription className="sr-only">Slides de la charla</DialogDescription>
            <Carousel>
              <CarouselContent>
                {slides.slideImages.map((slide, i) => (
                  <CarouselItem key={i}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide}
                      alt={`Slide ${i + 1} de ${slides.slideImages.length}`}
                      className="h-auto w-full rounded-sm border border-pcnGreen-200"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};

interface Props {
  talks: TalkWithEvent[];
  isAdmin: boolean;
  onEdit: (_talk: TalkWithEvent) => void;
  onDelete: (_talk: TalkWithEvent) => void;
}

/** The community's own talks: search and filters, grouped by year on the ruled grid. */
export function CommunityTalks({ talks, isAdmin, onEdit, onDelete }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('todas');
  const [playing, setPlaying] = useState<TalkWithEvent | null>(null);
  const [slides, setSlides] = useState<TalkWithEvent | null>(null);

  // Numbered oldest first, so #001 is the community's first talk and the number never changes.
  const numbers = useMemo(
    () => new Map(talks.map((talk, i) => [talk.id, talks.length - i])),
    [talks],
  );

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const visible = talks.filter((talk) => {
      if (filter === 'video' && !talk.videoUrl) return false;
      if (filter === 'slides' && !hasSlides(talk)) return false;
      if (!needle) return true;
      return [
        talk.title,
        talk.event?.name,
        talk.manualEventTitle,
        talkLocation(talk),
        ...talk.speakers.map((s) => s.speakerName),
      ].some((field) => field?.toLowerCase().includes(needle));
    });

    const byYear = new Map<string, TalkWithEvent[]>();
    for (const talk of visible) {
      const year = talkDate(talk)?.getFullYear().toString() ?? 'sin fecha';
      byYear.set(year, [...(byYear.get(year) ?? []), talk]);
    }
    return [...byYear.entries()];
  }, [talks, query, filter]);

  const visibleCount = groups.reduce((sum, [, items]) => sum + items.length, 0);

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-x border-t border-pcnGreen-200 bg-black/60 px-3 py-2">
        <SearchBar
          searchQuery={query}
          setSearchQuery={setQuery}
          placeholder="título, speaker o evento"
          label="Buscar charlas por título, speaker o evento"
          className="h-8 max-w-sm flex-1"
        />
        <span
          className="ml-auto flex border border-pcnGreen-200 font-mono text-[11px]"
          role="group"
          aria-label="Filtrar charlas"
        >
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={cn(
                'border-r border-pcnGreen-200 px-2 py-0.5 transition-colors last:border-r-0',
                filter === value
                  ? 'bg-pcnGreen text-black'
                  : 'text-muted-foreground hover:bg-pcnGreen/[0.06] hover:text-pcnGreen',
              )}
            >
              {label}
            </button>
          ))}
        </span>
      </div>

      {visibleCount === 0 ? (
        <p className="border border-dashed border-pcnGreen-200 py-10 text-center font-mono text-sm text-muted-foreground">
          <span className="text-pcnGreen">0 matches</span> · ninguna charla coincide con la búsqueda
        </p>
      ) : (
        groups.map(([year, items]) => (
          <section key={year} aria-labelledby={`charlas-${year}`}>
            <h2
              id={`charlas-${year}`}
              className="flex items-center gap-3 border-x border-t border-pcnGreen-200 bg-background px-3 py-1.5 font-mono text-xs"
            >
              <span className="text-glow font-semibold text-pcnGreen">## {year}</span>
              <span
                aria-hidden
                className="h-px flex-1 bg-[repeating-linear-gradient(90deg,hsl(var(--border))_0_4px,transparent_4px_8px)] opacity-60"
              />
              <span className="tabular-nums text-muted-foreground">
                {items.length} {items.length === 1 ? 'charla' : 'charlas'}
              </span>
            </h2>
            <RuledGrid className="grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {items.map((talk) => (
                <TalkCell
                  key={talk.id}
                  talk={talk}
                  index={numbers.get(talk.id) ?? 0}
                  isAdmin={isAdmin}
                  onPlay={() => setPlaying(talk)}
                  onSlides={() => setSlides(talk)}
                  onEdit={() => onEdit(talk)}
                  onDelete={() => onDelete(talk)}
                />
              ))}
            </RuledGrid>
          </section>
        ))
      )}

      <TalkMediaDialogs
        playing={playing}
        slides={slides}
        onClosePlaying={() => setPlaying(null)}
        onCloseSlides={() => setSlides(null)}
      />
    </>
  );
}
