'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { RANGE_PRESETS, type RangePreset } from '@/lib/metrics-range';
import { cn } from '@/lib/utils';
import { DateInput } from '@/components/ui/date-input';

const inputDate = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(date);

const segmentClassName = (active: boolean) =>
  cn(
    'border-r border-pcnGreen-200 px-2.5 last:border-r-0 hover:text-pcnGreen',
    active
      ? 'bg-pcnGreen/15 text-pcnGreen shadow-[inset_0_-2px_0_#04f4be]'
      : 'text-muted-foreground',
  );

/**
 * Preset ranges plus a custom from/to, and whether to count admins, kept in the URL so a view
 * can be shared.
 */
export function RangeFilter({
  preset,
  from,
  to,
  includeAdmins = false,
}: {
  preset: RangePreset | null;
  from: Date;
  to: Date;
  /** Admins (mostly the people building the site) are left out unless asked. */
  includeAdmins?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [desde, setDesde] = useState(inputDate(from));
  const [hasta, setHasta] = useState(inputDate(to));
  const rangeQuery = preset ? `rango=${preset}` : `desde=${inputDate(from)}&hasta=${inputDate(to)}`;

  const go = (query: string, admins = includeAdmins) =>
    startTransition(() => router.push(`/metricas?${query}${admins ? '&admins=1' : ''}`));

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
            className={segmentClassName(preset === id)}
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
      <div
        className="flex h-8 items-center border border-pcnGreen-200"
        role="group"
        aria-label="Visitas de admins"
      >
        <span className="border-r border-pcnGreen-200 px-2 text-muted-foreground/70">admins:</span>
        <button
          type="button"
          aria-pressed={!includeAdmins}
          onClick={() => go(rangeQuery, false)}
          className={cn(segmentClassName(!includeAdmins), 'h-full')}
        >
          excluir
        </button>
        <button
          type="button"
          aria-pressed={includeAdmins}
          onClick={() => go(rangeQuery, true)}
          className={cn(segmentClassName(includeAdmins), 'h-full')}
        >
          incluir
        </button>
      </div>
    </div>
  );
}
