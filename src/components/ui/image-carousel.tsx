'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ImageCarouselProps {
  images: string[];
  className?: string;
}

export function ImageCarousel({ images, className }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [images.length, isHovered]);

  return (
    <div
      className={cn('relative aspect-video w-full overflow-hidden rounded-lg', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={images[currentIndex]}
        alt={`Imagen ${currentIndex + 1}`}
        className="h-full w-full object-cover transition-opacity duration-300"
        style={{ opacity: isHovered ? 0.7 : 1 }}
      />
      {isHovered && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <span className="text-lg font-medium text-white">Ver todas las fotos</span>
        </div>
      )}
    </div>
  );
}
