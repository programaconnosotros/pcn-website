'use client';

import React, { useState } from 'react';
import { Heading3 } from '../ui/heading-3';
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
import Image from 'next/image';

type EventPhotosProps = {
  images: Images[];
};

const EventPhotos: React.FC<EventPhotosProps> = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <div>
      <Heading3 className="mb-4 mt-8 text-2xl font-semibold">Fotos</Heading3>

      {images.length === 0 && (
        <p className="mt-4 w-full text-center text-sm text-muted-foreground">
          No hay imágenes aún.
        </p>
      )}

      {images.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((image, index) => (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <div className="group relative cursor-pointer">
                  <Image
                    src={image.imgSrc}
                    alt={`Imagen ${index + 1}`}
                    width={300}
                    height={300}
                    className="h-full w-full transform rounded-lg object-cover shadow-lg transition-transform group-hover:scale-105"
                    onClick={() => setCurrentImageIndex(index)}
                  />
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl px-6 py-4">
                <DialogHeader>
                  <DialogTitle>Galería de Imágenes</DialogTitle>
                </DialogHeader>
                <Carousel
                  opts={{
                    startIndex: currentImageIndex,
                  }}
                >
                  <CarouselContent>
                    {images.map((img, i) => (
                      <CarouselItem key={i} className="flex items-center justify-center">
                        <Image
                          src={img.imgSrc}
                          alt={`Imagen ${i + 1}`}
                          width={600}
                          height={600}
                          className="w-full rounded-lg shadow-lg"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious aria-label="Ver imagen anterior" />
                  <CarouselNext aria-label="Ver siguiente imagen" />
                </Carousel>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventPhotos;
