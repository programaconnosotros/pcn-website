'use client';

import { useId, useState } from 'react';
import type { GrowthPoint } from './member-stats';

const WIDTH = 600;
const HEIGHT = 140;
const PAD_TOP = 10;
const PAD_BOTTOM = 18;

const monthLabel = (date: Date) =>
  date.toLocaleDateString('es-AR', { month: 'short', year: 'numeric', timeZone: 'UTC' });

/**
 * How many accounts the community had at the end of each month: one series (a 2px line over a
 * soft area), with a crosshair and a tooltip on hover or keyboard focus.
 */
export function MemberGrowthChart({ points }: { points: GrowthPoint[] }) {
  const gradientId = useId();
  const [active, setActive] = useState<number | null>(null);
  if (points.length < 2) return null;

  const max = Math.max(...points.map((p) => p.total));
  const x = (i: number) => (i / (points.length - 1)) * WIDTH;
  const y = (total: number) => PAD_TOP + (1 - total / max) * (HEIGHT - PAD_TOP - PAD_BOTTOM);
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.total).toFixed(1)}`);
  const baseline = HEIGHT - PAD_BOTTOM;
  const area = `${line.join(' ')} L${WIDTH},${baseline} L0,${baseline} Z`;
  const point = active === null ? null : points[active];

  const pick = (clientX: number, box: DOMRect) => {
    const ratio = Math.min(1, Math.max(0, (clientX - box.left) / box.width));
    setActive(Math.round(ratio * (points.length - 1)));
  };

  return (
    <figure className="relative">
      <figcaption className="mb-1 flex items-baseline justify-between font-mono text-[11px] text-muted-foreground">
        <span>
          <span className="text-pcnGreen-500">$ </span>wc -l miembros --por-mes
        </span>
        <span className="tabular-nums">{monthLabel(points[0].month)} → hoy</span>
      </figcaption>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="block h-36 w-full touch-none overflow-visible outline-none"
        role="img"
        aria-label={`Miembros por mes: de ${points[0].total} a ${points.at(-1)!.total}`}
        tabIndex={0}
        onPointerMove={(event) => pick(event.clientX, event.currentTarget.getBoundingClientRect())}
        onPointerLeave={() => setActive(null)}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
          event.preventDefault();
          const step = event.key === 'ArrowLeft' ? -1 : 1;
          setActive((current) =>
            Math.min(points.length - 1, Math.max(0, (current ?? points.length - 1) + step)),
          );
        }}
        onBlur={() => setActive(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#04f4be" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#04f4be" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            x2={WIDTH}
            y1={PAD_TOP + ratio * (baseline - PAD_TOP)}
            y2={PAD_TOP + ratio * (baseline - PAD_TOP)}
            stroke="currentColor"
            strokeOpacity="0.08"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <line
          x1="0"
          x2={WIDTH}
          y1={baseline}
          y2={baseline}
          stroke="currentColor"
          strokeOpacity="0.2"
          vectorEffect="non-scaling-stroke"
        />
        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line.join(' ')}
          fill="none"
          stroke="#04f4be"
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="drop-shadow-[0_0_6px_rgba(4,244,190,0.6)]"
        />
        {active !== null && (
          <line
            x1={x(active)}
            x2={x(active)}
            y1={PAD_TOP}
            y2={baseline}
            stroke="#04f4be"
            strokeOpacity="0.5"
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
      {point && active !== null && (
        <div
          role="status"
          className="pointer-events-none absolute top-6 z-10 -translate-x-1/2 border border-pcnGreen-200 bg-background/95 px-2 py-1 font-mono text-[11px] whitespace-nowrap shadow-[0_0_12px_rgba(4,244,190,0.25)]"
          style={{ left: `${Math.min(90, Math.max(10, (active / (points.length - 1)) * 100))}%` }}
        >
          <p className="text-muted-foreground">{monthLabel(point.month)}</p>
          <p className="text-foreground tabular-nums">
            {point.total} miembros
            {point.joined > 0 && <span className="text-muted-foreground"> · +{point.joined}</span>}
          </p>
        </div>
      )}
    </figure>
  );
}
