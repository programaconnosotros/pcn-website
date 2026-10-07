import type { ReactNode } from 'react';
import { LocalShortDate } from '@/components/ui/local-date-time';
import { MemoryCover } from './memory-cover';
import { MemoryFlyer } from './memory-flyer';
import type { CoverFraming } from '@/lib/cover-framing';

type Stat = { value: number; label: string };

/**
 * The opening of a past event's page: a wide photo of the night, or several taking turns (or,
 * without photos, a blurred copy of the flyer) with the catalog number, name, date, place and
 * what it left, and the flyer itself on the right, which opens full screen.
 */
export function MemoryHero({
  name,
  date,
  place,
  catalogNumber,
  covers,
  flyer,
  stats,
  coverPicker,
  framing,
  flyerCredits,
}: {
  name: string;
  date: Date;
  place: string | null;
  catalogNumber: number;
  /** Landscape photos of the event, shown full bleed; with more than one they take turns. */
  covers: string[];
  flyer: string | undefined;
  stats: Stat[];
  /** Controls to choose and frame the cover, for whoever can edit the event. */
  coverPicker?: ReactNode;
  /** How the chosen cover is framed. */
  framing?: CoverFraming;
  /** Who designed the flyer shown, credited under it. */
  flyerCredits?: ReactNode;
}) {
  const cover = covers.length > 0;

  return (
    <header className="relative isolate flex min-h-[18rem] overflow-hidden bg-black sm:min-h-[22rem] md:aspect-[21/9] md:min-h-0">
      {cover ? (
        <MemoryCover photos={covers} framing={framing} />
      ) : (
        flyer && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={flyer}
            alt=""
            aria-hidden
            fetchPriority="high"
            className="absolute inset-0 -z-10 h-full w-full scale-125 object-cover opacity-50 blur-2xl"
          />
        )
      )}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/55 to-black/10"
      />
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/60 via-transparent to-transparent"
      />

      {coverPicker}

      <div className="flex w-full items-end gap-6 p-4 sm:p-6">
        <div className="flex min-w-0 flex-1 flex-col gap-2 text-white">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-pcnGreen">
            Nº {String(catalogNumber).padStart(3, '0')} · así fue
          </p>
          <h2 className="text-balance font-mono text-2xl font-bold leading-tight tracking-tight [text-shadow:0_2px_12px_rgba(0,0,0,0.6)] sm:text-4xl">
            {name}
          </h2>
          <p className="font-mono text-xs text-white/75 sm:text-sm">
            <LocalShortDate date={date} />
            {place && <> · {place}</>}
          </p>
          {stats.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/15 pt-3 font-mono">
              {stats.map((stat) => (
                <li key={stat.label} className="flex items-baseline gap-1.5">
                  <span className="text-lg font-semibold tabular-nums text-pcnGreen sm:text-xl">
                    {stat.value}
                  </span>
                  <span className="text-[11px] text-white/60">{stat.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* The flyer hangs on the right like a framed print, over the photo too. */}
        {flyer && (
          <div className="hidden max-w-[42%] shrink-0 flex-col items-end gap-1.5 sm:flex">
            <MemoryFlyer src={flyer} eventName={name} />
            {flyerCredits}
          </div>
        )}
      </div>
    </header>
  );
}
