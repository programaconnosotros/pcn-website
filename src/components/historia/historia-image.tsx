'use client';

import { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type ImageAspect = 'auto' | 'photo' | 'flyer';

const aspectClasses: Record<ImageAspect, string> = {
  auto: '',
  photo: 'aspect-[3/2]',
  flyer: 'aspect-square',
};

interface HistoriaImageProps {
  src: string;
  alt: string;
  /** `photo` and `flyer` crop to a fixed ratio so galleries stay aligned. */
  aspect?: ImageAspect;
  className?: string;
}

export function HistoriaImage({ src, alt, aspect = 'auto', className }: HistoriaImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`Ampliar imagen: ${alt}`}
        className={cn(
          'group relative block w-full overflow-hidden border border-pcnGreen-200 bg-muted/30 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pcnPurple dark:focus-visible:ring-pcnGreen',
          aspectClasses[aspect],
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={cn('w-full', aspect === 'auto' ? 'h-auto' : 'h-full object-cover')}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-2 right-2 rounded-sm bg-black/60 p-1.5 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[90vw] max-w-4xl overflow-hidden border-none p-0 [&>button]:right-2 [&>button]:top-2 [&>button]:rounded-full [&>button]:bg-black/50 [&>button]:text-white [&>button]:hover:bg-black/70">
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <div className="flex h-[85vh] items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="max-h-full max-w-full object-contain"
              loading="eager"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface HistoriaGalleryProps {
  images: { src: string; alt: string }[];
  aspect?: Exclude<ImageAspect, 'auto'>;
  className?: string;
}

/** Responsive grid of same-ratio images. Two images share a row, more wrap in threes. */
export function HistoriaGallery({ images, aspect = 'photo', className }: HistoriaGalleryProps) {
  return (
    <div
      className={cn(
        'grid gap-2',
        images.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3',
        className,
      )}
    >
      {images.map((image) => (
        <HistoriaImage key={image.src} src={image.src} alt={image.alt} aspect={aspect} />
      ))}
    </div>
  );
}
