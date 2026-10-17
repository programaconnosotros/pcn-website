'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Lightbulb, MicVocal } from 'lucide-react';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { TALK_IDEA_AREAS, talkIdeas, type TalkIdea } from '@/data/talk-ideas';
import { cn } from '@/lib/utils';

export const TALK_CONTACT_URL = 'https://wa.me/5493815777562';

const ALL = 'todas';

const levelClassName: Record<TalkIdea['level'], string> = {
  inicial: 'text-pcnGreen-700',
  intermedio: 'text-amber-400/90',
  avanzado: 'text-rose-400/90',
};

const ExampleLink = ({ example }: { example: NonNullable<TalkIdea['example']> }) => {
  const external = example.href.startsWith('http');
  return (
    <Link
      href={example.href}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
      className="inline-flex w-fit items-center gap-1 font-mono text-[11px] text-pcnGreen-600 hover:text-pcnGreen"
    >
      <span className="text-muted-foreground">ejemplo en esta web:</span> {example.label}
      <ArrowUpRight className="size-3" />
    </Link>
  );
};

/** Inspiration for members who want to give a talk but don't know what about. */
export function TalkIdeas() {
  const [area, setArea] = useState(ALL);
  const ideas = area === ALL ? talkIdeas : talkIdeas.filter((idea) => idea.area === area);

  return (
    <div className="mb-14">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
          <Lightbulb className="size-3.5 text-pcnGreen" aria-hidden />
          <span>
            <span className="text-pcnGreen-500">$ </span>
            ¿querés dar una charla y no sabés de qué? arrancá por acá
          </span>
        </p>
        <div role="group" aria-label="Filtrar por tema" className="flex h-8 flex-wrap gap-1">
          {[ALL, ...TALK_IDEA_AREAS].map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={area === option}
              onClick={() => setArea(option)}
              className={cn(
                'h-full rounded-sm border px-2 font-mono text-[11px] transition-colors',
                area === option
                  ? 'border-pcnGreen-600 bg-pcnGreen/10 text-pcnGreen'
                  : 'border-pcnGreen-200 text-muted-foreground hover:border-pcnGreen-500 hover:text-foreground',
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <RuledGrid className="grid-cols-1 lg:grid-cols-2">
        {ideas.map((idea) => (
          <article key={idea.title} className={cn(ruledCellClassName, 'flex flex-col gap-1.5 p-4')}>
            <p className="flex items-center gap-2 font-mono text-[11px]">
              <span className="border border-pcnGreen-200 px-1 leading-4 text-pcnGreen-700">
                {idea.area}
              </span>
              <span className={levelClassName[idea.level]}>{idea.level}</span>
            </p>
            <h3 className="font-mono text-sm leading-snug font-semibold">{idea.title}</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">{idea.description}</p>
            {idea.example && <ExampleLink example={idea.example} />}
          </article>
        ))}
      </RuledGrid>

      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-muted-foreground">
        <MicVocal className="size-3.5 text-pcnGreen" aria-hidden />
        ¿Te copa alguna, o tenés otra idea?
        <Link
          href={TALK_CONTACT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-pcnGreen hover:underline"
        >
          contanos y la armamos juntos ↗
        </Link>
      </p>
    </div>
  );
}
