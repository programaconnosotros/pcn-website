'use client';

import * as React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

// ─── Placeholder ─────────────────────────────────────────────────────────────

function EventFlyerPlaceholder({ variant }: { variant: 'card' | 'detail' }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900',
        variant === 'card' ? 'aspect-square w-full' : 'aspect-video w-full',
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.webp" alt="PCN" className="h-20 w-20 object-contain opacity-30" />
    </div>
  );
}

// ─── Carousel ─────────────────────────────────────────────────────────────────

type EventFlyerCarouselProps = {
  images: string[];
  eventName: string;
  variant?: 'card' | 'detail';
};

export function EventFlyerCarousel({
  images,
  eventName,
  variant = 'card',
}: EventFlyerCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    const handleSelect = () => setCurrent(api.selectedScrollSnap());
    api.on('select', handleSelect);
    return () => {
      api.off('select', handleSelect);
    };
  }, [api]);

  const imageContainerClass =
    variant === 'card'
      ? 'aspect-square w-full overflow-hidden'
      : 'w-full overflow-hidden';

  const imgClass =
    variant === 'card'
      ? 'h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105'
      : 'h-auto w-full object-cover';

  // No images → placeholder
  if (images.length === 0) {
    return <EventFlyerPlaceholder variant={variant} />;
  }

  // Single image → no carousel controls
  if (images.length === 1) {
    return (
      <div className={imageContainerClass}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[0]} alt={`Flyer de ${eventName}`} className={imgClass} />
      </div>
    );
  }

  // Multiple images → full carousel with navigation
  return (
    <div className="relative">
      <Carousel setApi={setApi} opts={{ loop: true }}>
        <CarouselContent className="-ml-0">
          {images.map((src, i) => (
            <CarouselItem key={i} className="pl-0">
              <div className={imageContainerClass}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Flyer de ${eventName} – imagen ${i + 1} de ${images.length}`}
                  className={imgClass}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation arrows — stopPropagation so they don't trigger <Link> navigation */}
        <button
          type="button"
          aria-label="Imagen anterior"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            api?.scrollPrev();
          }}
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Imagen siguiente"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            api?.scrollNext();
          }}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          <ArrowRight className="h-4 w-4" />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir a imagen ${i + 1}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                api?.scrollTo(i);
              }}
              className={cn(
                'h-1.5 rounded-full transition-all duration-200',
                i === current ? 'w-4 bg-white' : 'w-1.5 bg-white/50',
              )}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}
