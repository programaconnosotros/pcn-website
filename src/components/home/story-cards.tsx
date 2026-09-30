import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Eyebrow } from './section-header';

const cards = [
  {
    eyebrow: 'Historia',
    title: 'Cómo llegamos hasta acá',
    description:
      'Por qué decidimos crear la comunidad y todos los pasos que dimos para llegar a donde estamos hoy.',
    href: '/historia',
    image: '/IMG_8959.webp',
    cta: 'Leer la historia',
  },
  {
    eyebrow: 'Galería',
    title: 'Recuerdos de la comunidad',
    description: 'Charlas, juntadas y eventos. Conocé a la gente que hace PCN.',
    href: '/galeria',
    image: '/pcn-header.webp',
    cta: 'Ver galería',
  },
];

export const StoryCards = () => (
  <section className="grid gap-4 md:grid-cols-2">
    {cards.map((card) => (
      <Link
        key={card.href}
        href={card.href}
        className="group relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-3xl border border-white/[0.06] md:min-h-[400px]"
      >
        <Image
          src={card.image}
          alt={card.title}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />
        <div className="absolute inset-0 bg-pcnGreen/0 transition-colors duration-500 group-hover:bg-pcnGreen/[0.04]" />

        <div className="relative p-7 md:p-8">
          <Eyebrow>{card.eyebrow}</Eyebrow>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            {card.title}
          </h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70 md:text-base">
            {card.description}
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white">
            <span className="flex size-9 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur transition-all duration-300 group-hover:border-pcnGreen group-hover:bg-pcnGreen group-hover:text-black">
              <ArrowUpRight className="size-4" />
            </span>
            {card.cta}
          </span>
        </div>
      </Link>
    ))}
  </section>
);
