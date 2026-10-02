'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { RandomGalleryPhoto } from '@/lib/gallery';
import { useBackgroundActive } from './os-processes';

const INTERVAL_MS = 2000;
// Signed thumbnail URLs last at least an hour; a fresh sample comes well before they expire.
const REFRESH_MS = 30 * 60 * 1000;

/**
 * Desktop widget that flips through random photos uploaded to the gallery. Clicking the current
 * photo opens its page in the gallery. Pauses with the other background processes.
 */
export function OsPhotos({
  covered,
  onOpen,
}: {
  covered: boolean;
  onOpen: (path: string) => void;
}) {
  const active = useBackgroundActive(covered);
  const [photos, setPhotos] = useState<RandomGalleryPhoto[] | null>(null);
  const [index, setIndex] = useState(0);

  // Fetched on the client so the server and client render the same empty frame.
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch('/api/galeria/aleatorias')
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then(({ photos }: { photos: RandomGalleryPhoto[] }) => {
          if (cancelled) return;
          setPhotos(photos);
          setIndex(0);
        })
        .catch(() => {
          if (!cancelled) setPhotos((current) => current ?? []);
        });
    load();
    const id = window.setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const count = photos?.length ?? 0;

  useEffect(() => {
    if (!active || count < 2) return;
    // Warm the cache so the upcoming photo swaps in without a flash.
    new Image().src = photos![(index + 1) % count].thumbUrl;
    const id = window.setTimeout(() => setIndex((index + 1) % count), INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [active, index, count, photos]);

  // Nothing uploaded yet: leave the wallpaper clean.
  if (photos && count === 0) return null;

  const photo = photos?.[index] ?? null;

  return (
    <button
      type="button"
      disabled={!photo}
      onClick={() => photo && onOpen(`/galeria/${photo.id}`)}
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
          {photo
            ? `${String(index + 1).padStart(2, '0')}/${String(count).padStart(2, '0')}`
            : '--/--'}
        </span>
      </span>

      <span className="relative block aspect-square overflow-hidden bg-black">
        <AnimatePresence initial={false}>
          {photo && (
            <motion.img
              key={photo.id}
              src={photo.thumbUrl}
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
