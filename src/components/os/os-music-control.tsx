'use client';

import { ChevronDown, Music, Pause, Play } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { externalPlaylists, radios, type MusicSet } from '@/components/music/music-sets';
import type { MusicPlayer } from '@/components/music/use-music-player';
import { cn } from '@/lib/utils';

/** Three bars that bounce while the music plays and rest flat when it is paused. */
const Equalizer = ({ playing }: { playing: boolean }) => (
  <span aria-hidden className="flex h-3 items-end gap-px">
    {[0, 0.25, 0.5].map((delay) => (
      <span
        key={delay}
        className={cn(
          'h-full w-[3px] origin-bottom bg-pcnGreen',
          playing ? 'animate-equalizer' : 'scale-y-[0.3]',
        )}
        style={{ animationDelay: `${delay}s` }}
      />
    ))}
  </span>
);

const SetItems = ({
  label,
  sets,
  player,
}: {
  label: string;
  sets: MusicSet[];
  player: MusicPlayer;
}) => (
  <>
    <DropdownMenuLabel className="text-[10px] font-normal tracking-[0.18em] text-pcnGreen-600 uppercase">
      {`// ${label}`}
    </DropdownMenuLabel>
    {sets.map((set) => {
      const active = player.current?.id === set.id;
      return (
        <DropdownMenuItem
          key={set.id}
          onSelect={() => player.play(set)}
          className={cn('gap-2', active && 'text-pcnGreen')}
        >
          <span className="w-3 shrink-0 text-pcnGreen">{active ? '>' : ''}</span>
          <span className="truncate">{set.title}</span>
        </DropdownMenuItem>
      );
    })}
  </>
);

interface OsMusicControlProps {
  player: MusicPlayer;
  menuTriggerClassName: string;
  menuContentClassName: string;
}

/**
 * Music control in the menu bar: shows what is playing, pauses and resumes it, and picks another
 * radio or playlist. Playing a set opens the same player dialog as the music page.
 */
export function OsMusicControl({
  player,
  menuTriggerClassName,
  menuContentClassName,
}: OsMusicControlProps) {
  const { current, playing } = player;

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={() => (playing ? player.pause() : player.play(current ?? radios[0]))}
        title={playing ? 'Pausar' : 'Reproducir'}
        aria-label={playing ? 'Pausar música' : 'Reproducir música'}
        className={cn(menuTriggerClassName, 'flex h-5 items-center px-1.5')}
      >
        {playing ? (
          <Pause className="size-3 fill-current" />
        ) : (
          <Play className="size-3 fill-current" />
        )}
      </button>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          className={cn(menuTriggerClassName, 'flex items-center gap-1.5')}
          title={current ? `Reproduciendo: ${current.title}` : 'Elegir música'}
        >
          {current ? <Equalizer playing={playing} /> : <Music className="size-3" />}
          <span className="max-w-44 truncate">
            {current ? current.title.toLowerCase() : 'música'}
          </span>
          <ChevronDown className="size-3 opacity-70" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={cn(menuContentClassName, 'w-72')}>
          <SetItems label="radios de la comunidad" sets={radios} player={player} />
          <DropdownMenuSeparator />
          <SetItems label="playlists recomendadas" sets={externalPlaylists} player={player} />
          {current && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={player.show}>Mostrar reproductor</DropdownMenuItem>
              <DropdownMenuItem onSelect={player.stop}>Detener</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
