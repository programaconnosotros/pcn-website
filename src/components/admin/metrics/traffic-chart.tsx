'use client';

import { useId, useState } from 'react';
import { cn } from '@/lib/utils';

export type TrafficPoint = { day: string; visits: number; visitors: number; signups: number };

const SERIES = [
  { id: 'visits', label: 'visitas' },
  { id: 'visitors', label: 'visitantes' },
  { id: 'signups', label: 'altas' },
] as const;

type SeriesId = (typeof SERIES)[number]['id'];

const WIDTH = 1000;
const HEIGHT = 220;
const PAD_TOP = 12;

const niceMax = (value: number) => {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const steps = [1, 2, 2.5, 5, 10].map((step) => step * magnitude);
  return steps.find((step) => step >= value) ?? 10 * magnitude;
};

/**
 * Area chart of one metric over time, with a crosshair and tooltip on hover. Switching the
 * metric redraws the same axis instead of overlaying scales that don't share units.
 */
export function TrafficChart({ points, unit }: { points: TrafficPoint[]; unit: 'day' | 'week' }) {
  const [series, setSeries] = useState<SeriesId>('visits');
  const [hover, setHover] = useState<number | null>(null);
  const gradientId = useId();

  const format = new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
  const values = points.map((point) => point[series]);
  const max = niceMax(Math.max(0, ...values));
  const total = values.reduce((sum, value) => sum + value, 0);
  const step = points.length > 1 ? WIDTH / (points.length - 1) : WIDTH;
  const x = (index: number) => (points.length > 1 ? index * step : WIDTH / 2);
  const y = (value: number) => PAD_TOP + (1 - value / max) * (HEIGHT - PAD_TOP);
  const line = values.map((value, index) => `${index ? 'L' : 'M'}${x(index)},${y(value)}`).join('');
  const area = `${line}L${x(values.length - 1)},${HEIGHT}L${x(0)},${HEIGHT}Z`;
  const label = SERIES.find(({ id }) => id === series)!.label;
  const active = hover === null ? null : points[hover];
  const ticks = [0, 0.5, 1].map((share) => Math.round(max * share));

  return (
    <figure className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
        <div className="flex border border-pcnGreen-200" role="group" aria-label="Métrica">
          {SERIES.map(({ id, label: seriesLabel }) => (
            <button
              key={id}
              type="button"
              aria-pressed={series === id}
              onClick={() => setSeries(id)}
              className={cn(
                'border-r border-pcnGreen-200 px-2 py-0.5 last:border-r-0 hover:text-pcnGreen',
                series === id ? 'bg-pcnGreen/15 text-pcnGreen' : 'text-muted-foreground',
              )}
            >
              {seriesLabel}
            </button>
          ))}
        </div>
        <span className="tabular-nums text-muted-foreground">
          {active ? (
            <>
              {unit === 'week' ? 'semana del ' : ''}
              {format.format(new Date(active.day))} ·{' '}
              <span className="text-pcnGreen">{active[series].toLocaleString('es-AR')}</span>{' '}
              {label}
            </>
          ) : (
            <>
              total <span className="text-foreground">{total.toLocaleString('es-AR')}</span> {label}{' '}
              · por {unit === 'week' ? 'semana' : 'día'}
            </>
          )}
        </span>
      </div>

      <div className="relative">
        {/* Y axis labels sit over the recessive grid lines. */}
        {ticks.map((tick) => (
          <span
            key={tick}
            className="pointer-events-none absolute left-0 -translate-y-1/2 font-mono text-[10px] tabular-nums text-muted-foreground/60"
            style={{ top: `${(y(tick) / HEIGHT) * 100}%` }}
          >
            {tick.toLocaleString('es-AR')}
          </span>
        ))}
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="h-56 w-full overflow-visible"
          role="img"
          aria-label={`${label} por ${unit === 'week' ? 'semana' : 'día'}: ${total} en total`}
          onMouseLeave={() => setHover(null)}
          onMouseMove={(event) => {
            const box = event.currentTarget.getBoundingClientRect();
            const ratio = (event.clientX - box.left) / box.width;
            setHover(
              Math.max(0, Math.min(points.length - 1, Math.round(ratio * (points.length - 1)))),
            );
          }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#04f4be" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#04f4be" stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((tick) => (
            <line
              key={tick}
              x1={0}
              x2={WIDTH}
              y1={y(tick)}
              y2={y(tick)}
              stroke="currentColor"
              className="text-pcnGreen-200"
              strokeDasharray={tick === 0 ? undefined : '3 5'}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path d={area} fill={`url(#${gradientId})`} />
          <path
            d={line}
            fill="none"
            stroke="#04f4be"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            style={{ filter: 'drop-shadow(0 0 4px rgba(4,244,190,0.7))' }}
          />
          {hover !== null && (
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={0}
              y2={HEIGHT}
              stroke="#04f4be"
              strokeOpacity={0.5}
              strokeDasharray="2 4"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
        {hover !== null && (
          // An HTML dot keeps its round shape while the SVG stretches to the container.
          <span
            className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-pcnGreen shadow-[0_0_10px_#04f4be]"
            style={{
              left: `${(x(hover) / WIDTH) * 100}%`,
              top: `${(y(values[hover]) / HEIGHT) * 100}%`,
            }}
          />
        )}
      </div>
      <figcaption className="flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>{points[0] && format.format(new Date(points[0].day))}</span>
        <span>
          {points.length > 2 && format.format(new Date(points[Math.floor(points.length / 2)].day))}
        </span>
        <span>{points.at(-1) && format.format(new Date(points.at(-1)!.day))}</span>
      </figcaption>
    </figure>
  );
}
