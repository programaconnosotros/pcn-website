'use client';

import { useEffect, useId, useRef, type Ref } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import {
  dialogCloseClassName,
  dialogContentClassName,
  dialogOverlayClassName,
  dialogTitleClassName,
} from '@/components/ui/dialog-surface';
import { cn } from '@/lib/utils';
import type { MusicSet } from './music-sets';

// 16:9 and capped, so the video never takes over large screens.
const playerSizeClassName =
  'flex w-[min(94vw,calc((100dvh-7.5rem)*16/9))] max-w-3xl flex-col gap-0 overflow-hidden bg-black p-0';

const embedUrl = (set: MusicSet) =>
  `https://www.youtube-nocookie.com/embed/${set.id}?autoplay=1&rel=0&enablejsapi=1`;

const YoutubeLink = ({ set }: { set: MusicSet }) => (
  <a
    href={`https://www.youtube.com/watch?v=${set.id}`}
    target="_blank"
    rel="noopener noreferrer"
    title="Ver en YouTube"
    className="flex shrink-0 items-center gap-1 rounded-sm border border-pcnGreen-200 px-2 py-1 text-[11px] text-pcnGreen-700 transition-colors hover:border-pcnGreen-500 hover:text-pcnGreen"
  >
    <span className="max-sm:hidden">youtube</span>
    <ArrowUpRight className="size-3.5" />
  </a>
);

const headerClassName =
  'flex items-center gap-3 border-b border-pcnGreen-200 py-2 pl-3 pr-12 font-mono';

/** A YouTube music set playing in a dialog. */
export function MusicPlayerDialog({ set, onClose }: { set: MusicSet; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(playerSizeClassName, '[&>button:last-child]:top-2.5')}>
        <header className={headerClassName}>
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate text-sm font-semibold">{set.title}</DialogTitle>
            <DialogDescription className="truncate text-[11px] text-pcnGreen-600">
              <span className="text-pcnGreen-500">@ </span>
              {set.channel}
            </DialogDescription>
          </div>
          <YoutubeLink set={set} />
        </header>
        <iframe
          key={set.id}
          src={embedUrl(set)}
          title={set.title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="aspect-video w-full border-0"
        />
      </DialogContent>
    </Dialog>
  );
}

interface BackgroundMusicPlayerProps {
  set: MusicSet;
  open: boolean;
  onClose: () => void;
  iframeRef: Ref<HTMLIFrameElement>;
  onIframeLoad: () => void;
}

/**
 * The same player dialog, but closing it only hides it: the video stays mounted and keeps
 * playing in the background until it is shown again. It is not a Radix dialog because Radix
 * disables pointer events on the page for as long as a modal dialog stays mounted.
 */
export function BackgroundMusicPlayer({
  set,
  open,
  onClose,
  iframeRef,
  onIframeLoad,
}: BackgroundMusicPlayerProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const state = open ? 'open' : 'closed';
  // Hide once the closing animation has run, so the panel never lingers or catches clicks.
  const hiddenClassName = !open && 'invisible pointer-events-none [transition:visibility_0s_0.25s]';

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <>
      <div
        aria-hidden
        data-state={state}
        onClick={onClose}
        className={cn(dialogOverlayClassName, 'z-6000', hiddenClassName)}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal={open}
        aria-hidden={!open}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        data-state={state}
        className={cn(dialogContentClassName, playerSizeClassName, 'z-6000', hiddenClassName)}
      >
        <header className={headerClassName}>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className={cn(dialogTitleClassName, 'truncate text-sm')}>
              {set.title}
            </h2>
            <p id={descriptionId} className="truncate font-mono text-[11px] text-pcnGreen-600">
              <span className="text-pcnGreen-500">@ </span>
              {set.channel}
            </p>
          </div>
          <YoutubeLink set={set} />
        </header>
        <iframe
          key={set.id}
          ref={iframeRef}
          onLoad={onIframeLoad}
          src={embedUrl(set)}
          title={set.title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="aspect-video w-full border-0"
        />
        <button
          type="button"
          onClick={onClose}
          title="Ocultar (la música sigue sonando)"
          className={cn(dialogCloseClassName, 'top-2.5')}
        >
          <X className="size-4 transition-transform duration-300 group-hover:rotate-90" />
          <span className="sr-only">Ocultar reproductor</span>
        </button>
      </div>
    </>
  );
}
