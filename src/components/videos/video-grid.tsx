'use client';

import { useState } from 'react';
import { ArrowUpRight, Play } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import type { Video } from './videos';

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

const VideoCell = ({ video, onPlay }: { video: Video; onPlay: () => void }) => (
  <button
    type="button"
    onClick={onPlay}
    className={cn(ruledCellClassName, 'group flex flex-col gap-2 p-3 text-left')}
  >
    <span className="relative block aspect-video overflow-hidden rounded-sm border border-pcnGreen-200 bg-black transition-colors group-hover:border-pcnGreen-500">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        className="size-full object-cover opacity-80 transition-[opacity,transform] duration-300 group-hover:scale-[1.03] group-hover:opacity-100"
      />
      <span className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.18)_0_1px,transparent_1px_3px)]" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex size-9 items-center justify-center rounded-sm border border-pcnGreen-500 bg-black/70 text-pcnGreen opacity-0 shadow-[0_0_18px_-4px_rgba(4,244,190,0.8)] transition-opacity duration-200 group-hover:opacity-100">
          <Play className="size-4 fill-current" />
        </span>
      </span>
      <span className="absolute bottom-1.5 right-1.5 bg-black/80 px-1 font-mono text-[10px] tabular-nums text-pcnGreen">
        {formatDuration(video.durationSeconds)}
      </span>
    </span>

    <span className="flex items-start gap-2 font-mono text-xs">
      <span className="line-clamp-2 flex-1 font-semibold leading-snug group-hover:text-pcnGreen">
        {video.title}
      </span>
      <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground max-sm:hidden">
        {formatDate(video.date)}
      </span>
    </span>
    <span className="truncate font-mono text-[11px] text-muted-foreground/70">
      <span className="text-pcnGreen-500">@ </span>
      {byline(video)}
    </span>
  </button>
);

/** YouTube videos laid out on the ruled grid; each one plays in a dialog without leaving the page. */
export function VideoGrid({ videos }: { videos: Video[] }) {
  const [playing, setPlaying] = useState<Video | null>(null);

  return (
    <>
      <RuledGrid className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
        {videos.map((video) => (
          <VideoCell key={video.id} video={video} onPlay={() => setPlaying(video)} />
        ))}
      </RuledGrid>

      <Dialog open={!!playing} onOpenChange={(open) => !open && setPlaying(null)}>
        {playing && (
          <DialogContent className="flex w-[94vw] max-w-5xl flex-col gap-0 overflow-hidden rounded-sm border border-pcnGreen-300 bg-black p-0 [&>button:last-child]:top-2.5">
            <header className="flex items-center gap-3 border-b border-pcnGreen-200 py-2 pl-3 pr-12 font-mono">
              <div className="min-w-0 flex-1">
                <DialogTitle className="truncate text-sm font-semibold">
                  {playing.title}
                </DialogTitle>
                <DialogDescription className="truncate text-[11px] text-pcnGreen-600">
                  <span className="text-pcnGreen-500">@ </span>
                  {byline(playing)} · {formatDate(playing.date)}
                </DialogDescription>
              </div>
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
    </>
  );
}
