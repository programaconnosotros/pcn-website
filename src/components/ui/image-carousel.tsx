'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ImageCarouselProps {
  images: string[];
  className?: string;
}

export function ImageCarousel({ images, className }: ImageCarouselProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered || images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 300);

    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  if (images.length === 0) {
    return (
      <div
        className={cn(
          'relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100',
          className,
        )}
      >
        <div className="flex h-full items-center justify-center">
          <span className="text-gray-500">No hay imágenes disponibles</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative aspect-square w-full overflow-hidden rounded-lg hover:cursor-pointer',
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push('/photos')}
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
