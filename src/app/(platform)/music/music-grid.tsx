'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { MusicPlayerDialog } from '@/components/music/music-player-dialog';
import type { MusicSet } from '@/components/music/music-sets';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';

const MusicCell = ({ set, onPlay }: { set: MusicSet; onPlay: () => void }) => (
  <div className={cn(ruledCellClassName, 'group relative flex flex-col gap-2 p-3')}>
    <span className="relative block aspect-video overflow-hidden rounded-sm border border-pcnGreen-200 bg-black transition-colors group-hover:border-pcnGreen-500">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${set.id}/hqdefault.jpg`}
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
    </span>

    {/* The title's button stretches over the whole cell so any click plays the set. */}
    <button
      type="button"
      onClick={onPlay}
      className="truncate text-left font-mono text-xs font-semibold after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-1 focus-visible:after:ring-inset focus-visible:after:ring-pcnGreen group-hover:text-pcnGreen"
    >
      {set.title}
    </button>
    <p className="-mt-1 truncate font-mono text-[11px] text-muted-foreground/70">
      <span className="text-pcnGreen-500">@ </span>
      {set.channel}
    </p>
  </div>
);

/** Music sets laid out on the ruled grid; each one plays in a dialog without leaving the page. */
export function MusicGrid({ sets }: { sets: MusicSet[] }) {
  const [playing, setPlaying] = useState<MusicSet | null>(null);

  return (
    <>
      <RuledGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {sets.map((set) => (
          <MusicCell key={set.id} set={set} onPlay={() => setPlaying(set)} />
        ))}
      </RuledGrid>

      {playing && (
        <MusicPlayerDialog set={playing} open onOpenChange={(open) => !open && setPlaying(null)} />
      )}
    </>
  );
}
