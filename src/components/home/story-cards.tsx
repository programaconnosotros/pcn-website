'use client';

import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { Eyebrow } from './section-header';

// How long each photo stays before the next one fades in.
const PHOTO_MS = 2000;

const cards = [
  {
    id: 'historia',
    eyebrow: 'Historia',
    title: 'Cómo llegamos hasta acá',
    description:
      'Por qué decidimos crear la comunidad y todos los pasos que dimos para llegar a donde estamos hoy.',
    href: '/historia',
    fallback: '/IMG_8959.webp',
    cta: 'Leer la historia',
  },
  {
    id: 'galeria',
    eyebrow: 'Galería',
    title: 'Recuerdos de la comunidad',
    description: 'Charlas, juntadas y eventos. Conocé a la gente que hace PCN.',
    href: '/galeria',
    fallback: '/pcn-header.webp',
    cta: 'Ver galería',
  },
] as const;

const shuffle = (items: string[]) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Cycles through `photos` in random order, every photo once before any repeats, and never the
 * same one twice in a row. `delay` staggers it against the other card.
 */
function useRotatingPhoto(photos: string[], delay: number) {
  // The server already shuffled the photos, so the first round can use them as they come.
  const [state, setState] = useState({ deck: photos, index: 0, previous: null as string | null });

  useEffect(() => {
    if (photos.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setState(({ deck, index }) => {
          const previous = deck[index];
          if (index + 1 < deck.length) return { deck, index: index + 1, previous };
          // New round: reshuffle, but don't open it with the photo that just closed the last one.
          const next = shuffle(photos);
          if (next[0] === previous) next.push(next.shift()!);
          return { deck: next, index: 0, previous };
        });
      }, PHOTO_MS);
    }, delay);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [photos, delay]);

  return state;
}

function CardBackground({
  photos,
  fallback,
  delay,
}: {
  photos: string[];
  fallback: string;
  delay: number;
}) {
  const { deck, index, previous } = useRotatingPhoto(photos, delay);
  const current = deck[index] ?? fallback;
  const next = deck.length > 1 ? deck[(index + 1) % deck.length] : null;
  // The outgoing photo fades out over the incoming one, and the upcoming one preloads hidden.
  const layers = [...new Set([previous, current, next].filter((src): src is string => !!src))];

  return (
    <>
      {layers.map((src) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden
          className={cn(
            'absolute inset-0 size-full object-cover transition-opacity duration-700 ease-out',
            src === current ? 'opacity-70 group-hover:opacity-90' : 'opacity-0',
          )}
        />
      ))}
    </>
  );
}

export const StoryCards = ({ photos }: { photos: { historia: string[]; galeria: string[] } }) => (
  <RuledGrid className="md:grid-cols-2">
    {cards.map((card, cardIndex) => (
      <Link
        key={card.href}
        href={card.href}
        className={cn(
          ruledCellClassName,
          'relative flex min-h-[220px] group flex-col justify-end overflow-hidden md:min-h-[260px]',
        )}
      >
        {/* The two cards change one second apart, so they never flip at the same time. */}
        <CardBackground
          photos={photos[card.id]}
          fallback={card.fallback}
          delay={cardIndex * (PHOTO_MS / 2)}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/55 to-black/10" />
        <div className="absolute inset-0 bg-pcnGreen/0 transition-colors duration-500 group-hover:bg-pcnGreen/[0.04]" />

        <div className="relative p-4 md:p-5">
          <Eyebrow>{card.eyebrow}</Eyebrow>
          <h3 className="mt-2 font-mono text-lg font-semibold tracking-tight text-white md:text-xl">
            {card.title}
          </h3>
          <p className="mt-1 max-w-md text-sm leading-relaxed text-white/70">{card.description}</p>
          <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs font-medium text-pcnGreen">
            {card.cta.toLowerCase()}
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
    ))}
  </RuledGrid>
);
