'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Play, Share2 } from 'lucide-react';
import type { GalleryTile } from '@/lib/gallery';
import { parallaxStyle, useParallax } from './use-parallax';
import { formatPhotoDate, keyCapClassName, padIndex, photoCaption } from './photo-utils';
import { DownloadKey } from './download-key';
import { formatDuration } from '@/lib/gallery-filters';

interface PhotoCardProps {
  photo: GalleryTile;
  index: number;
  total: number;
  href: string;
  /** Shows a share key next to the download one. */
  onShare?: () => void;
  /** Above the fold: load right away instead of lazily. */
  priority?: boolean;
}

const cornerClassName =
  'pointer-events-none absolute size-3 border-pcnGreen opacity-0 transition-all duration-300 group-hover:opacity-100 group-focus-within:opacity-100';

// A dimmed, scanlined thumbnail that powers up on hover: full colour, lit corner brackets and a
// file-name caption sliding up from the bottom. The photo is slightly taller than its frame and drifts
// against the scroll (and away from the pointer), so the grid reads as windows onto a deeper layer.
export function PhotoCard({ photo, index, total, href, onShare, priority }: PhotoCardProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  useParallax(frameRef);

  return (
    <div ref={frameRef} className="relative aspect-square w-full group overflow-hidden bg-black">
      <Link
        href={href}
        className="absolute inset-0 focus-visible:outline-hidden"
        aria-label={`Ver ${photo.kind === 'VIDEO' ? 'video' : 'foto'}: ${photoCaption(photo)}`}
      >
        <span
          aria-hidden
          style={parallaxStyle}
          className="absolute inset-x-0 top-[-5%] block h-[110%] transition-transform duration-150 ease-out will-change-transform"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.thumbUrl}
            alt=""
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            className="h-full w-full object-cover object-top brightness-[0.8] saturate-[0.7] transition duration-500 ease-out group-focus-within:brightness-100 group-focus-within:saturate-100 group-hover:scale-[1.04] group-hover:brightness-100 group-hover:saturate-100"
          />
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.22)_0_1px,transparent_1px_3px)] transition-opacity duration-500 group-hover:opacity-0"
        />
        <span
          aria-hidden
          className="absolute top-1.5 left-1.5 rounded-sm bg-black/70 px-1 font-mono text-[10px] text-pcnGreen-600 tabular-nums backdrop-blur-xs"
        >
          #{padIndex(total - index, total)}
        </span>
        {photo.kind === 'VIDEO' && (
          <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-sm bg-black/70 px-1 font-mono text-[10px] text-pcnGreen tabular-nums backdrop-blur-xs transition-opacity group-hover:opacity-0">
            <Play className="size-2.5 fill-current" />
            {photo.durationSeconds !== null ? formatDuration(photo.durationSeconds) : 'video'}
            <span className="sr-only"> (video)</span>
          </span>
        )}
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 translate-y-full bg-linear-to-t from-black via-black/70 to-transparent px-2 pt-8 pb-1.5 text-left font-mono text-[10px] leading-tight transition-transform duration-300 ease-out group-focus-within:translate-y-0 group-hover:translate-y-0"
        >
          <span className="block truncate text-pcnGreen">{photoCaption(photo)}</span>
          <span className="block truncate text-white/50 tabular-nums">
            {formatPhotoDate(photo.takenAt)}
            {photo.tags.length > 0 &&
              ` · ${photo.tags.length} ${photo.tags.length === 1 ? 'persona' : 'personas'}`}
          </span>
        </span>
      </Link>

      <span aria-hidden className={`${cornerClassName} top-1 left-1 border-t-2 border-l-2`} />
      <span aria-hidden className={`${cornerClassName} top-1 right-1 border-t-2 border-r-2`} />
      <span aria-hidden className={`${cornerClassName} bottom-1 left-1 border-b-2 border-l-2`} />
      <span aria-hidden className={`${cornerClassName} right-1 bottom-1 border-r-2 border-b-2`} />

      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:hidden">
        <DownloadKey photoId={photo.id} />
        {onShare && (
          <button type="button" className={keyCapClassName} onClick={onShare} title="Compartir">
            <Share2 className="size-3.5" />
            <span className="sr-only">Compartir</span>
          </button>
        )}
      </div>
    </div>
  );
}
