'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// How long each photo stays before fading into the next.
const SLIDE_MS = 7000;

/**
 * The hero's backdrop: one photo, or several that cross-fade in turn (unless the viewer prefers
 * reduced motion, then it stays on the first).
 */
export function MemoryCover({ photos }: { photos: string[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (photos.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(
      () => setCurrent((index) => (index + 1) % photos.length),
      SLIDE_MS,
    );
    return () => window.clearInterval(timer);
  }, [photos.length]);

  return (
    <>
      {photos.map((src, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden
          fetchPriority={index === 0 ? 'high' : 'low'}
          loading={index === 0 ? 'eager' : 'lazy'}
          className={cn(
            'absolute inset-0 -z-10 h-full w-full object-cover transition-opacity duration-1000 ease-in-out',
            index === current ? 'opacity-100' : 'opacity-0',
          )}
        />
      ))}
    </>
  );
}
