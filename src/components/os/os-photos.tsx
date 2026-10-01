'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { photos } from '@/components/photo-gallery/photos';
import { useBackgroundActive } from './os-processes';

const INTERVAL_MS = 2000;

const randomIndex = (except: number) => {
  const next = Math.floor(Math.random() * (photos.length - 1));
  return next >= except ? next + 1 : next;
};

/**
 * Desktop widget that flips through random community photos. Clicking the current photo opens
 * it large in the gallery. Pauses with the other background processes.
 */
export function OsPhotos({
  covered,
  onOpen,
}: {
  covered: boolean;
  onOpen: (path: string) => void;
}) {
  const active = useBackgroundActive(covered);
  const [index, setIndex] = useState<number | null>(null);
  const [next, setNext] = useState<number | null>(null);

  // Picked on the client so the server and client render the same empty frame.
  useEffect(() => {
    const first = Math.floor(Math.random() * photos.length);
    setIndex(first);
    setNext(randomIndex(first));
  }, []);

  useEffect(() => {
    if (!active || next === null) return;
    // Warm the cache so the upcoming photo swaps in without a flash.
    new Image().src = photos[next].image;
    const id = window.setTimeout(() => {
      setIndex(next);
      setNext(randomIndex(next));
    }, INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [active, next]);

  const photo = index === null ? null : photos[index];

  return (
    <button
      type="button"
      disabled={!photo}
      onClick={() => photo && onOpen(`/galeria?foto=${photo.id}`)}
      aria-label={photo ? 'Ver foto en la galería' : 'Fotos de la comunidad'}
      className="group absolute right-6 top-1/2 hidden w-[300px] -translate-y-1/2 select-none flex-col overflow-hidden border border-pcnGreen-200 bg-black/70 text-left font-mono text-[10px] leading-[1.45] text-pcnGreen-700 opacity-80 shadow-[0_0_40px_-18px_rgba(4,244,190,0.5)] outline-none transition-[opacity,border-color,box-shadow] duration-200 hover:border-pcnGreen-500 hover:opacity-100 hover:shadow-[0_0_40px_-10px_rgba(4,244,190,0.7)] focus-visible:border-pcnGreen focus-visible:opacity-100 xl:bottom-64 xl:top-auto xl:translate-y-0 [@media(min-height:760px)]:flex"
    >
      <span className="flex items-center gap-2 border-b border-pcnGreen-200 px-2 py-1 text-pcnGreen-600">
        <span className="flex gap-1">
          <span className="size-1.5 bg-pcnGreen-300" />
          <span className="size-1.5 bg-pcnGreen-400" />
          <span className="size-1.5 bg-pcnGreen" />
        </span>
        <span className="flex-1 truncate">feh --random ~/galeria</span>
        <span className="tabular-nums text-pcnGreen">
          {photo ? `#${String(photo.id).padStart(2, '0')}` : '--'}
        </span>
      </span>

      <span className="relative block aspect-square overflow-hidden bg-black">
        <AnimatePresence initial={false}>
          {photo && (
            <motion.img
              key={photo.id}
              src={photo.image}
              alt=""
              draggable={false}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute inset-0 size-full object-cover grayscale-[35%] transition-[filter] duration-300 group-hover:grayscale-0"
            />
          )}
        </AnimatePresence>
        {/* Green tint and scanlines keep the photos on the terminal palette. */}
        <span className="pointer-events-none absolute inset-0 bg-pcnGreen/10 mix-blend-color transition-opacity duration-300 group-hover:opacity-0" />
        <span className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.25)_0_1px,transparent_1px_3px)]" />
        <span className="pointer-events-none absolute left-1.5 top-1.5 size-2.5 border-l border-t border-pcnGreen" />
        <span className="pointer-events-none absolute bottom-1.5 right-1.5 size-2.5 border-b border-r border-pcnGreen" />
        <span className="absolute bottom-1.5 left-2 bg-black/70 px-1 text-pcnGreen opacity-0 transition-opacity group-hover:opacity-100">
          ↵ abrir en galería
        </span>
      </span>
    </button>
  );
}
