'use client';

import type { Ref } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ArrowUpRight, X } from 'lucide-react';
import { DialogDescription, DialogTitle } from '@/components/ui/dialog';
import {
  dialogCloseClassName,
  dialogContentClassName,
  dialogOverlayClassName,
} from '@/components/ui/dialog-surface';
import { cn } from '@/lib/utils';
import type { MusicSet } from './music-sets';

interface MusicPlayerDialogProps {
  set: MusicSet;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Keeps the player mounted while the dialog is closed, so the music keeps playing in the
   * background and the dialog can be shown again later.
   */
  keepPlaying?: boolean;
  iframeRef?: Ref<HTMLIFrameElement>;
  onIframeLoad?: () => void;
}

/** A YouTube music set playing in a dialog, 16:9 and capped so it never takes over the screen. */
export function MusicPlayerDialog({
  set,
  open,
  onOpenChange,
  keepPlaying = false,
  iframeRef,
  onIframeLoad,
}: MusicPlayerDialogProps) {
  const forceMount = keepPlaying ? true : undefined;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal forceMount={forceMount}>
        <DialogPrimitive.Overlay
          forceMount={forceMount}
          className={cn(dialogOverlayClassName, 'data-[state=closed]:pointer-events-none')}
        />
        <DialogPrimitive.Content
          forceMount={forceMount}
          className={cn(
            dialogContentClassName,
            'flex w-[min(94vw,calc((100dvh_-_7.5rem)*16/9))] max-w-3xl flex-col gap-0 overflow-hidden bg-black p-0',
            'data-[state=closed]:pointer-events-none',
          )}
        >
          <header className="flex items-center gap-3 border-b border-pcnGreen-200 py-2 pl-3 pr-12 font-mono">
            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate text-sm font-semibold">{set.title}</DialogTitle>
              <DialogDescription className="truncate text-[11px] text-pcnGreen-600">
                <span className="text-pcnGreen-500">@ </span>
                {set.channel}
              </DialogDescription>
            </div>
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
          </header>
          <iframe
            key={set.id}
            ref={iframeRef}
            onLoad={onIframeLoad}
            src={`https://www.youtube-nocookie.com/embed/${set.id}?autoplay=1&rel=0&enablejsapi=1`}
            title={set.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="aspect-video w-full border-0"
          />
          <DialogPrimitive.Close className={cn(dialogCloseClassName, 'top-2.5')}>
            <X className="size-4 transition-transform duration-300 group-hover:rotate-90" />
            <span className="sr-only">Cerrar</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
