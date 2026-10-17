import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ruledCellClassName } from '@/components/ui/ruled-grid';
import type { Stance, TechnologyTimeline } from '@/data/opiniones-tecnologia';
import { cn } from '@/lib/utils';

// One technology's timeline on /conversaciones/opiniones, drawn like `git log --graph`: a glowing
// spine that changes color with the group's stance, a commit dot per opinion and log-line
// metadata. The graph is decorative (aria-hidden); the stance is always spelled out as text.
// Animations and hover states live in globals.css (.opinion-*).

export const STANCE: Record<Stance, { label: string; color: string; dot: string; text: string }> = {
  positiva: { label: 'a favor', color: '#04f4be', dot: 'bg-pcnGreen', text: 'text-pcnGreen' },
  mixta: { label: 'dividido', color: '#fbbf24', dot: 'bg-amber-400', text: 'text-amber-400' },
  negativa: { label: 'en contra', color: '#f87171', dot: 'bg-red-400', text: 'text-red-400' },
};

const STANCE_ORDER: Stance[] = ['positiva', 'mixta', 'negativa'];

const monthYear = new Intl.DateTimeFormat('es-AR', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** The stances of a timeline as a strip of colored ticks, oldest to newest. */
export const StanceStrip = ({ stances, className }: { stances: Stance[]; className?: string }) => (
  <span className={cn('flex h-2 gap-px', className)} aria-hidden>
    {stances.map((stance, i) => (
      <span key={i} className={cn('w-1.5', STANCE[stance].dot)} />
    ))}
  </span>
);

/** How many opinions of each stance a timeline has, e.g. "6 a favor · 3 dividido". */
export const stanceTally = (stances: Stance[]) =>
  STANCE_ORDER.flatMap((stance) => {
    const count = stances.filter((s) => s === stance).length;
    return count ? [`${count} ${STANCE[stance].label}`] : [];
  }).join(' · ');

export const OpinionTimeline = ({ slug, name, summary, opinions }: TechnologyTimeline) => {
  const stances = opinions.map(({ stance }) => stance);
  const head = opinions.at(-1);

  return (
    <section
      id={slug}
      aria-labelledby={`${slug}-title`}
      className={cn('opinion-timeline flex scroll-mt-20 flex-col', ruledCellClassName)}
    >
      <header className="opinion-header relative overflow-hidden border-b border-dashed border-pcnGreen-200 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2
            id={`${slug}-title`}
            className="text-base font-semibold text-foreground transition-[color,text-shadow] [.opinion-timeline:hover_&]:text-glow"
          >
            {name}
          </h2>
          {head && (
            <p className="font-mono text-[11px] text-muted-foreground">
              <span className="text-pcnGreen-600">HEAD →</span>{' '}
              <span className={STANCE[head.stance].text}>{STANCE[head.stance].label}</span>
            </p>
          )}
        </div>
        <p className="font-mono text-[11px] text-pcnGreen-600">
          <span aria-hidden className="text-pcnGreen select-none">
            ${' '}
          </span>
          git log --graph --{slug}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
          <StanceStrip stances={stances} className="h-1.5" />
          <span>
            {opinions.length} {opinions.length === 1 ? 'commit' : 'commits'} ·{' '}
            {stanceTally(stances)}
          </span>
        </div>
      </header>

      <ol className="flex-1 py-2" aria-label={`Línea de tiempo de ${name}`}>
        {opinions.map((opinion, i) => {
          const stance = STANCE[opinion.stance];
          const previous = opinions[i - 1]?.stance;
          const turned = previous !== undefined && previous !== opinion.stance;
          const isHead = i === opinions.length - 1;
          return (
            <li
              key={`${opinion.date}-${opinion.text}`}
              data-first={i === 0 || undefined}
              data-head={isHead || undefined}
              style={
                {
                  '--node': stance.color,
                  '--prev': STANCE[previous ?? opinion.stance].color,
                } as CSSProperties
              }
              className="opinion-commit relative grid grid-cols-[var(--gutter)_1fr] gap-x-2 pr-4 pl-2"
            >
              <span aria-hidden className="relative">
                <span className="opinion-rail" />
                <span className="opinion-node" />
                <span className="opinion-branch" />
              </span>
              <div className="opinion-body min-w-0 py-2">
                <p className="flex flex-wrap items-baseline gap-x-2 font-mono text-[11px] leading-5 text-muted-foreground">
                  <Link
                    href={opinion.conversation.href}
                    title={`«${opinion.conversation.title}»`}
                    className="opinion-hash text-pcnGreen-700 underline decoration-dotted underline-offset-2 transition-[color,text-shadow] hover:text-pcnGreen focus-visible:outline-1 focus-visible:outline-pcnGreen"
                  >
                    #{opinion.conversation.hash}
                  </Link>
                  <time dateTime={opinion.date} className="tabular-nums">
                    {monthYear.format(new Date(`${opinion.date}T12:00:00Z`))}
                  </time>
                  <span className={stance.text}>[{stance.label}]</span>
                  {turned && (
                    <span className="text-pcnGreen-600">
                      <span aria-hidden>↯ </span>giro
                    </span>
                  )}
                  {isHead && (
                    <span className="border border-pcnGreen-500 px-1 leading-4 text-pcnGreen text-glow">
                      HEAD
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-foreground/90">{opinion.text}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <p
        aria-hidden
        className="border-t border-dashed border-pcnGreen-200 px-4 py-1.5 font-mono text-[10px] text-pcnGreen-500 select-none"
      >
        (END)
      </p>
    </section>
  );
};
