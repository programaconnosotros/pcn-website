'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';

type CarouselImage = {
  src: string;
  alt: string;
  description: JSX.Element;
};

const carouselImages: CarouselImage[] = [
  {
    src: '/lightning-talks/ddd-y-hexagonal.webp',
    alt: 'Agus presentando Domain-Driven Design, Hexagonal Architecture & Vertical Slicing',
    description: (
      <p>
        Agus presentando <b>Domain-Driven Design, Hexagonal Architecture & Vertical Slicing</b>.
      </p>
    ),
  },
  {
    src: '/lightning-talks/java-funcional.webp',
    alt: 'Chelo presentando Java Funcional: Agilizando el Procesamiento de Datos',
    description: (
      <p>
        Chelo presentando <b>Java Funcional: Agilizando el Procesamiento de Datos</b>.
      </p>
    ),
  },
  {
    src: '/lightning-talks/arquitectura-modular.webp',
    alt: 'Mauri presentando Arquitectura Modular en Aplicaciones Móviles',
    description: (
      <p>
        Mauri presentando <b>Arquitectura Modular en Aplicaciones Móviles</b>.
      </p>
    ),
  },
  {
    src: '/lightning-talks/database-indexing.webp',
    alt: 'Fini presentando Database Indexing',
    description: (
      <p>
        Fini presentando <b>Database Indexing</b>.
      </p>
    ),
  },
  {
    src: '/lightning-talks/unit-testing.webp',
    alt: 'Tobi presentando Introducción al Unit Testing',
    description: (
      <p>
        Tobi presentando <b>Introducción al Unit Testing</b>.
      </p>
    ),
  },
  {
    src: '/lightning-talks/chatgpt.webp',
    alt: 'Facu presentando Programación Optimizada con ChatGPT',
    description: (
      <p>
        Facu presentando <b>Programación Optimizada con ChatGPT</b>.
      </p>
    ),
  },
  {
    src: '/lightning-talks/arquitectura-software.webp',
    alt: 'Agus presentando Introducción a la Arquitectura de Software',
    description: (
      <p>
        Agus presentando <b>Arquitectura de Software: Frontend, Backend, Bases de Datos y más</b>.
      </p>
    ),
  },
  {
    src: '/lightning-talks/diseno-perfecto.webp',
    alt: 'Mauri presentando Diseño Perfecto',
    description: (
      <p>
        Mauri presentando <b>Diseño Perfecto</b>.
      </p>
    ),
  },
  {
    src: '/lightning-talks/paradigmas.webp',
    alt: 'Chelo presentando Paradigmas de Programación',
    description: (
      <p>
        Chelo presentando <b>Paradigmas de Programación</b>.
      </p>
    ),
  },
  {
    src: '/lightning-talks/debugging.webp',
    alt: 'Tobi presentando Depuración de código con C++ & Python',
    description: (
      <p>
        Tobi presentando <b>Depuración de código con C++ & Python</b>.
      </p>
    ),
  },
];

const LightningTalksCarousel = () => {
  return (
    <div className="flex items-center justify-center">
      <Carousel className="mt-12 w-full max-w-[75%]">
        <CarouselContent className="-ml-4">
          {carouselImages.map((photo, index) => (
            <CarouselItem key={index} className="flex flex-col md:basis-1/2 lg:basis-1/3">
              <img src={photo.src} alt={photo.alt} className="h-full w-full object-cover" />
              <span className="mt-2 text-sm">{photo.description}</span>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export const LightningTalks = () => (
  <div className="bg-white py-14 sm:py-24">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
        <p className="text-base font-semibold leading-7 text-indigo-600">
          Nuestra actividad favorita
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Lightning Talks
        </h1>

        <div className="mt-10 grid max-w-xl grid-cols-1 gap-8 text-base leading-7 text-gray-700 lg:max-w-none lg:grid-cols-2">
          <div>
            <p>
              La actividad consiste en presentar charlas cortas sobre temas técnicos, experiencias
              profesionales, reflexiones, descubrimientos, consejos, y demás. Cualquier miembro de
              la comunidad puede presentar una Lightning Talk.
            </p>

            <p className="mt-8">
              <b>Aprendizaje</b>: En sesiones cortas y dinámicas, miembros de la comunidad comparten
              ideas innovadoras, nuevas tecnologías y mejores prácticas. Podes aprender algo nuevo
              en cada charla y ampliar tu horizonte técnico.
            </p>

            <p className="mt-8">
              <b>Networking</b>: Conecta con otros profesionales o estudiantes apasionados por la
              tecnología. Las lightning talks son una excelente oportunidad para conocer gente
              nueva, intercambiar ideas y quizás encontrar tu próximo mentor o colaborador.
            </p>
          </div>

          <div>
            <p>
              <b>Compartir conocimiento</b>: Presentar en una lightning talk no solo te permite
              compartir tu conocimiento, sino que también mejora tus habilidades de comunicación y
              presentación. ¡Es una gran manera de construir confianza en vos mismo y en tus
              capacidades!
            </p>

            <p className="mt-8">
              <b>Inspiración y motivación</b>: Escuchar a otros profesionales compartir sus éxitos y
              desafíos puede ser increíblemente inspirador. Estas historias pueden darte el impulso
              que necesitas para llevar tus proyectos al siguiente nivel.
            </p>

            <p className="mt-8">
              <b>Visibilidad y reputación</b>: Participar activamente en la comunidad tecnológica te
              pone en el radar de otros profesionales y empresas. Es una excelente manera de
              destacar y demostrar tu compromiso con el crecimiento y la innovación.
            </p>
          </div>
        </div>
      </div>
    </div>

    <LightningTalksCarousel />
  </div>
);
