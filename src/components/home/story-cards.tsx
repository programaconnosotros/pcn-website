import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
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
  <RuledGrid className="md:grid-cols-2">
    {cards.map((card) => (
      <Link
        key={card.href}
        href={card.href}
        className={cn(
          ruledCellClassName,
          'group relative flex min-h-[220px] flex-col justify-end overflow-hidden md:min-h-[260px]',
        )}
      >
        <Image
          src={card.image}
          alt={card.title}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover opacity-70 transition-opacity duration-500 group-hover:opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />
        <div className="absolute inset-0 bg-pcnGreen/0 transition-colors duration-500 group-hover:bg-pcnGreen/[0.04]" />

        <div className="relative p-4 md:p-5">
          <Eyebrow>{card.eyebrow}</Eyebrow>
          <h3 className="mt-2 font-mono text-lg font-semibold tracking-tight text-white md:text-xl">
            {card.title}
          </h3>
          <p className="mt-1 max-w-md text-sm leading-relaxed text-white/70">{card.description}</p>
          <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs font-medium text-pcnGreen">
            {card.cta.toLowerCase()}
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    ))}
  </RuledGrid>
);
