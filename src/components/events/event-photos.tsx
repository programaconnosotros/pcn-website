'use client';

import React, { useState } from 'react';
import { Image as Images } from '@prisma/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

type EventPhotosProps = {
  images: Images[];
};

export const EventPhotos: React.FC<EventPhotosProps> = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (images.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">No hay imágenes aún.</p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {images.map((image, index) => (
        <Dialog key={index}>
          <DialogTrigger asChild>
            <div className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg">
              <img
                src={image.imgSrc}
                alt={`Imagen ${index + 1} del evento`}
                loading="lazy"
                className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-80"
                onClick={() => setCurrentImageIndex(index)}
              />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-4xl px-6 py-4">
            <DialogHeader>
              <DialogTitle>Galería de imágenes</DialogTitle>
            </DialogHeader>
            <Carousel
              opts={{
                startIndex: currentImageIndex,
              }}
            >
              <CarouselContent>
                {images.map((img, i) => (
                  <CarouselItem key={i} className="flex items-center justify-center">
                    <img
                      src={img.imgSrc}
                      alt={`Imagen ${i + 1} del evento`}
                      className="h-auto w-full rounded-lg"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
};
