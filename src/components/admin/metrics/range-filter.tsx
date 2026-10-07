'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { RANGE_PRESETS, type RangePreset } from '@/lib/metrics-range';
import { cn } from '@/lib/utils';
import { DateInput } from '@/components/ui/date-input';

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
      <div
        className="flex h-8 border border-pcnGreen-200"
        role="group"
        aria-label="Rango de fechas"
      >
        {RANGE_PRESETS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={preset === id}
            onClick={() => go(`rango=${id}`)}
            className={cn(
              'border-r border-pcnGreen-200 px-2.5 last:border-r-0 hover:text-pcnGreen',
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
          'flex h-8 items-center gap-1.5 border px-2',
          preset === null ? 'border-pcnGreen-600' : 'border-pcnGreen-200',
        )}
        onSubmit={(event) => {
          event.preventDefault();
          if (desde && hasta && desde <= hasta) go(`desde=${desde}&hasta=${hasta}`);
        }}
      >
        <DateInput bare required aria-label="Desde" value={desde} max={hasta} onChange={setDesde} />
        <span className="text-pcnGreen-500">→</span>
        <DateInput bare required aria-label="Hasta" value={hasta} min={desde} onChange={setHasta} />
        <button type="submit" className="ml-1 text-pcnGreen-700 hover:text-pcnGreen">
          aplicar
        </button>
      </form>
    </div>
  );
}
