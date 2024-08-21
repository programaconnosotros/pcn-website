'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';

const PhotoCarousel = () => {
  const photos: Array<{
    src: string;
    alt: string;
  }> = [
    {
      src: '/motivation/aeroparque-2.jpeg',
      alt: 'Code review en Aeroparque',
    },
    {
      src: '/motivation/eagerworks-1.jpeg',
      alt: 'Programando en Eagerworks',
    },
    {
      src: '/motivation/bariloche.jpeg',
      alt: 'Programando en Bariloche',
    },
    {
      src: '/motivation/edison.jpeg',
      alt: 'Estudiando en Edison',
    },
    {
      src: '/motivation/baltazar-1.jpeg',
      alt: 'Code review en Baltazar',
    },
    {
      src: '/motivation/hubavet.jpeg',
      alt: 'Programando con React Native',
    },
    {
      src: '/motivation/startbucks-1.jpeg',
      alt: 'Programando en Startbucks',
    },
    {
      src: '/motivation/eagerworks-2.jpeg',
      alt: 'Programando en Eagerworks',
    },
    {
      src: '/motivation/baltazar-2.jpeg',
      alt: 'Trabajando en Baltazar',
    },
    {
      src: '/motivation/aeropuerto-montevideo.jpeg',
      alt: 'Programando en el aeropuerto de Montevideo',
    },
    {
      src: '/motivation/aeroparque-1.jpeg',
      alt: 'Programando en el aeropuerto de Montevideo',
    },
    {
      src: '/motivation/baltazar-3.jpeg',
      alt: 'Trabajando en Baltazar',
    },
  ];

  return (
    <div className="flex items-center justify-center">
      <Carousel className="mt-12 w-full max-w-[75%]">
        <CarouselContent className="-ml-4">
          {photos.map((photo, index) => (
            <CarouselItem key={index} className="flex flex-col md:basis-1/2 lg:basis-1/3">
              <img src={photo.src} alt={photo.alt} className="h-full w-full object-cover" />
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export const Motivation = () => (
  <div className="bg-white py-14 sm:py-24">
    <div className="mx-auto mb-8 max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
        <p className="text-base font-semibold leading-7 text-indigo-600">
          Algo que siempre viene bien
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Encontrá motivación
        </h1>

        <div className="mt-10 grid max-w-xl grid-cols-1 gap-8 text-base leading-7 text-gray-700 lg:max-w-none lg:grid-cols-2">
          <p>
            Podés chequear en qué andan los otros miembros de la comunidad y encontrar la motivación
            que necesitás para seguir trabajando a full para conseguir tus objetivos.
          </p>

          <p>
            En nuestra cuenta de Instagram podés ver un montón de fotos sacadas por miembros de la
            comunidad mientras trabajan o estudian, con consejos muy valiosos. Compartí tus fotos y
            consejos con la comunidad!
          </p>
        </div>
      </div>
    </div>

    <PhotoCarousel />
  </div>
);
