'use client';

import { useState } from 'react';
import { Download, Maximize2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

/**
 * The flyer hanging on the right of a past event's header, like a framed print. Clicking it
 * opens it full screen.
 */
export function MemoryFlyer({ src, eventName }: { src: string; eventName: string }) {
  const [open, setOpen] = useState(false);
  const alt = `Flyer de ${eventName}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Ver el flyer de ${eventName} en pantalla completa`}
        className="group/flyer relative hidden max-w-[42%] shrink-0 cursor-zoom-in overflow-hidden rounded-sm shadow-2xl ring-1 ring-white/10 transition hover:ring-pcnGreen/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pcnGreen sm:block"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          // Fixed heights: the header's own height comes from its aspect ratio, so a percentage
          // here wouldn't resolve inside the button.
          className="block h-auto max-h-56 w-auto max-w-full object-contain transition duration-300 group-hover/flyer:scale-[1.02] md:max-h-72 lg:max-h-80"
        />
        <span
          aria-hidden
          className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-sm bg-black/70 text-pcnGreen opacity-0 backdrop-blur-sm transition-opacity group-hover/flyer:opacity-100 group-focus-visible/flyer:opacity-100"
        >
          <Maximize2 className="size-3.5" />
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[calc(100dvh-1.5rem)] w-auto max-w-[min(56rem,calc(100vw-1.5rem))] flex-col items-center gap-3 p-3">
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <DialogDescription className="sr-only">
            El flyer del evento en tamaño completo.
          </DialogDescription>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-[calc(100dvh-6rem)] w-auto max-w-full rounded-sm object-contain"
          />
          <a
            href={src}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-mono text-xs text-pcnGreen hover:underline"
          >
            <Download className="size-3.5" /> descargar flyer
          </a>
        </DialogContent>
      </Dialog>
    </>
  );
}
