'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { CalendarRange } from 'lucide-react';
import { RANGE_PRESETS, type RangePreset } from '@/lib/metrics-range';
import { cn } from '@/lib/utils';

const inputDate = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(date);

/** Preset ranges plus a custom from/to, kept in the URL so a view can be shared. */
export function RangeFilter({
  preset,
  from,
  to,
}: {
  preset: RangePreset | null;
  from: Date;
  to: Date;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [desde, setDesde] = useState(inputDate(from));
  const [hasta, setHasta] = useState(inputDate(to));

  const go = (query: string) => startTransition(() => router.push(`/metricas?${query}`));

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 font-mono text-xs transition-opacity',
        isPending && 'opacity-60',
      )}
      aria-busy={isPending}
    >
      <div className="flex border border-pcnGreen-200" role="group" aria-label="Rango de fechas">
        {RANGE_PRESETS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={preset === id}
            onClick={() => go(`rango=${id}`)}
            className={cn(
              'border-r border-pcnGreen-200 px-2.5 py-1 last:border-r-0 hover:text-pcnGreen',
              preset === id
                ? 'bg-pcnGreen/15 text-pcnGreen shadow-[inset_0_-2px_0_#04f4be]'
                : 'text-muted-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <form
        className={cn(
          'flex items-center gap-1.5 border px-2 py-0.5',
          preset === null ? 'border-pcnGreen-600' : 'border-pcnGreen-200',
        )}
        onSubmit={(event) => {
          event.preventDefault();
          if (desde && hasta && desde <= hasta) go(`desde=${desde}&hasta=${hasta}`);
        }}
      >
        <CalendarRange className="size-3.5 text-pcnGreen-600" aria-hidden />
        <label className="sr-only" htmlFor="metricas-desde">
          Desde
        </label>
        <input
          id="metricas-desde"
          type="date"
          value={desde}
          max={hasta}
          onChange={(event) => setDesde(event.target.value)}
          className="bg-transparent text-muted-foreground outline-none [color-scheme:dark] focus:text-foreground"
        />
        <span className="text-pcnGreen-500">→</span>
        <label className="sr-only" htmlFor="metricas-hasta">
          Hasta
        </label>
        <input
          id="metricas-hasta"
          type="date"
          value={hasta}
          min={desde}
          onChange={(event) => setHasta(event.target.value)}
          className="bg-transparent text-muted-foreground outline-none [color-scheme:dark] focus:text-foreground"
        />
        <button type="submit" className="ml-1 text-pcnGreen-700 hover:text-pcnGreen">
          aplicar
        </button>
      </form>
    </div>
  );
}
