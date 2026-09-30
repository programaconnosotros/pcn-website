'use client';

import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import { ChevronLeft, ChevronRight, Download, Share2, X } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  formatPhotoDate,
  keyCapClassName,
  padIndex,
  photoFileName,
  usePhotoDownload,
  type Photo,
} from './photo-utils';

interface PhotoDialogProps {
  photos: Photo[];
  currentPhotoIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (_index: number) => void;
  onShare: (_photo: Photo) => void;
}

const SWIPE_THRESHOLD = 50;

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="rounded-sm border border-pcnGreen-200 px-1 text-pcnGreen-600">{children}</kbd>
);

// Full-height photo viewer on the terminal dialog: a path/counter bar with key-cap actions, the
// photo on a black stage (it resolves with a short glitch once loaded), the caption, a filmstrip
// and keyboard hints. Arrows / swipe navigate, D downloads, S shares.
export function PhotoDialog({
  photos,
  currentPhotoIndex,
  isOpen,
  onClose,
  onNavigate,
  onShare,
}: PhotoDialogProps) {
  const { download, isDownloading } = usePhotoDownload();
  const [loadedId, setLoadedId] = useState<number | null>(null);
  const filmstripRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const currentPhoto = photos[currentPhotoIndex];
  const total = photos.length;

  const previousIndex = (currentPhotoIndex - 1 + total) % total;
  const nextIndex = (currentPhotoIndex + 1) % total;

  // Keep the active thumbnail centred in the filmstrip.
  useEffect(() => {
    filmstripRef.current
      ?.querySelector('[aria-current="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [currentPhotoIndex]);

  // Warm the cache so stepping to a neighbour is instant.
  useEffect(() => {
    [photos[previousIndex], photos[nextIndex]].forEach((photo) => {
      if (photo) new Image().src = photo.image;
    });
  }, [photos, previousIndex, nextIndex]);

  if (!currentPhoto) return null;

  const isLoaded = loadedId === currentPhoto.id;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'ArrowLeft') onNavigate(previousIndex);
    else if (e.key === 'ArrowRight') onNavigate(nextIndex);
    else if (e.key === 'd' || e.key === 'D') download(currentPhoto);
    else if (e.key === 's' || e.key === 'S') onShare(currentPhoto);
    else return;
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx > SWIPE_THRESHOLD) onNavigate(previousIndex);
    else if (dx < -SWIPE_THRESHOLD) onNavigate(nextIndex);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="flex h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-6xl flex-col gap-0 p-0 sm:h-[calc(100dvh-3rem)] sm:w-[calc(100vw-3rem)] [&>button:last-child]:hidden"
        aria-describedby={undefined}
        onKeyDown={handleKeyDown}
      >
        <header className="flex items-center gap-3 border-b border-dashed border-pcnGreen-200 py-2 pl-3 pr-2 text-xs">
          <p className="min-w-0 flex-1 truncate">
            <span className="text-pcnGreen-500">~/galeria/</span>
            <span className="text-pcnGreen">{photoFileName(currentPhoto)}</span>
          </p>
          <span className="shrink-0 tabular-nums text-muted-foreground">
            [<span className="text-pcnGreen">{padIndex(currentPhotoIndex + 1, total)}</span>/{total}
            ]
          </span>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              className={keyCapClassName}
              onClick={() => download(currentPhoto)}
              disabled={isDownloading}
              title="Descargar (D)"
            >
              <Download className="size-3.5" />
              <span className="sr-only">Descargar</span>
            </button>
            <button
              type="button"
              className={keyCapClassName}
              onClick={() => onShare(currentPhoto)}
              title="Compartir (S)"
            >
              <Share2 className="size-3.5" />
              <span className="sr-only">Compartir</span>
            </button>
            <DialogClose className={cn(keyCapClassName, 'group')} title="Cerrar (Esc)">
              <X className="size-4 transition-transform duration-300 group-hover:rotate-90" />
              <span className="sr-only">Cerrar</span>
            </DialogClose>
          </div>
        </header>

        <div
          className="relative min-h-0 flex-1 overflow-hidden bg-black"
          onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
          onTouchEnd={handleTouchEnd}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(4,244,190,0.06),transparent_70%)]"
          />
          {!isLoaded && (
            <p className="absolute inset-0 flex items-center justify-center text-xs text-pcnGreen-600">
              <span className="cursor-blink">cargando {photoFileName(currentPhoto)}</span>
            </p>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={currentPhoto.id}
            src={currentPhoto.image}
            alt={currentPhoto.title}
            onLoad={() => setLoadedId(currentPhoto.id)}
            className={cn(
              'absolute inset-0 m-auto max-h-full max-w-full select-none object-contain p-2 sm:p-4',
              isLoaded ? 'photo-glitch-in' : 'opacity-0',
            )}
            draggable={false}
          />

          <button
            type="button"
            onClick={() => onNavigate(previousIndex)}
            className={cn(keyCapClassName, 'absolute left-2 top-1/2 size-9 -translate-y-1/2')}
          >
            <ChevronLeft className="size-5" />
            <span className="sr-only">Anterior</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate(nextIndex)}
            className={cn(keyCapClassName, 'absolute right-2 top-1/2 size-9 -translate-y-1/2')}
          >
            <ChevronRight className="size-5" />
            <span className="sr-only">Siguiente</span>
          </button>
        </div>

        <footer className="border-t border-dashed border-pcnGreen-200">
          <div className="flex items-baseline gap-4 px-3 pt-2">
            <DialogTitle className="min-w-0 flex-1 truncate text-sm font-normal">
              {currentPhoto.title}
            </DialogTitle>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {formatPhotoDate(currentPhoto.date)}
            </span>
          </div>

          <div
            ref={filmstripRef}
            className="flex gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {photos.map((photo, index) => {
              const isCurrent = index === currentPhotoIndex;
              return (
                <button
                  key={photo.id}
                  type="button"
                  aria-current={isCurrent}
                  aria-label={`Foto ${index + 1}: ${photo.title}`}
                  onClick={() => onNavigate(index)}
                  className={cn(
                    'size-11 shrink-0 overflow-hidden rounded-sm border transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pcnGreen',
                    isCurrent
                      ? 'border-pcnGreen opacity-100 shadow-[0_0_12px_-2px_rgba(4,244,190,0.7)]'
                      : 'border-pcnGreen-100 opacity-40 grayscale hover:opacity-80 hover:grayscale-0',
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </button>
              );
            })}
          </div>

          <p className="flex items-center gap-4 border-t border-dashed border-pcnGreen-200 px-3 py-1.5 text-[10px] text-muted-foreground max-sm:hidden">
            <span>
              <Kbd>←</Kbd> <Kbd>→</Kbd> navegar
            </span>
            <span>
              <Kbd>D</Kbd> descargar
            </span>
            <span>
              <Kbd>S</Kbd> compartir
            </span>
            <span>
              <Kbd>Esc</Kbd> cerrar
            </span>
          </p>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
