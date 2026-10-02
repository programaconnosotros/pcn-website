import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, Minus, TrendingDown } from 'lucide-react';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { findProgramForPath, GENERIC_PROGRAM } from '@/components/os/programs';
import type { FunnelStep, PathCount } from '@/lib/product-metrics';
import { cn } from '@/lib/utils';

const number = (value: number) => value.toLocaleString('es-AR');
const percent = (value: number) =>
  `${value.toLocaleString('es-AR', { maximumFractionDigits: value < 10 ? 1 : 0 })}%`;

/** `// título` heading of each block, with an optional note on the right. */
export const PanelTitle = ({ children, note }: { children: ReactNode; note?: ReactNode }) => (
  <div className="mb-2 flex items-end justify-between gap-3 font-mono">
    <h2 className="text-[11px] uppercase tracking-[0.18em] text-pcnGreen">
      <span className="text-pcnGreen-500">{'// '}</span>
      {children}
    </h2>
    {note && <span className="text-[10px] text-muted-foreground">{note}</span>}
  </div>
);

/** Change against the previous period, with an arrow so it never relies on color alone. */
export function Delta({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) {
    return current === 0 ? (
      <span className="inline-flex items-center gap-0.5 text-muted-foreground">
        <Minus className="size-3" aria-hidden />
        sin cambios
      </span>
    ) : (
      <span className="inline-flex items-center gap-0.5 text-pcnGreen">
        <ArrowUpRight className="size-3" aria-hidden />
        nuevo
      </span>
    );
  }
  const change = ((current - previous) / previous) * 100;
  const Icon = change > 0 ? ArrowUpRight : change < 0 ? ArrowDownRight : Minus;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 tabular-nums',
        change > 0 ? 'text-pcnGreen' : change < 0 ? 'text-red-400' : 'text-muted-foreground',
      )}
      title={`antes: ${number(previous)}`}
    >
      <Icon className="size-3" aria-hidden />
      {/* Past 10x a percentage stops being readable; say how many times bigger it got. */}
      {change >= 900
        ? `×${(current / previous).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
        : `${change > 0 ? '+' : ''}${percent(Math.abs(change) < 0.05 ? 0 : change)}`}
    </span>
  );
}

/** A tiny single-series line for a KPI tile. */
export function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const max = Math.max(1, ...values);
  const points = values
    .map((value, index) => `${(index / (values.length - 1)) * 100},${30 - (value / max) * 28}`)
    .join(' ');
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-7 w-full" aria-hidden>
      <polyline
        points={points}
        fill="none"
        stroke="#04f4be"
        strokeOpacity={0.8}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function KpiTile({
  label,
  value,
  current,
  previous,
  hint,
  spark,
}: {
  label: string;
  value: string;
  current: number;
  /** Leave out when the metric has no comparable previous value. */
  previous?: number;
  hint?: string;
  spark?: number[];
}) {
  return (
    <div className={cn(ruledCellClassName, 'flex flex-col gap-1 p-3 font-mono')}>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-2xl font-semibold tabular-nums text-foreground [text-shadow:0_0_14px_rgba(4,244,190,0.35)]">
        {value}
      </span>
      <span className="flex items-center justify-between gap-2 text-[10px]">
        {previous !== undefined && <Delta current={current} previous={previous} />}
        {hint && <span className="truncate text-muted-foreground/70">{hint}</span>}
      </span>
      {spark && <Sparkline values={spark} />}
    </div>
  );
}

/** A labelled horizontal bar: the bar shows the share of `max`, the number sits beside it. */
function Bar({ value, max }: { value: number; max: number }) {
  return (
    <span className="relative block h-1.5 flex-1 bg-pcnGreen-200/30">
      <span
        className="absolute inset-y-0 left-0 rounded-r-[2px] bg-pcnGreen-600 group-hover:bg-pcnGreen group-hover:shadow-[0_0_8px_rgba(4,244,190,0.7)]"
        style={{ width: `${max > 0 ? Math.max(1.5, (value / max) * 100) : 0}%` }}
      />
    </span>
  );
}

const moduleName = (section: string) => {
  if (section === '/autenticacion') return { name: 'Registro y login', icon: null };
  const program = findProgramForPath(section);
  return program === GENERIC_PROGRAM
    ? { name: section, icon: null }
    : { name: program.name, icon: program.icon };
};

export function ModuleRanking({
  modules,
  previous,
}: {
  modules: { section: string; visits: number; visitors: number; members: number }[];
  previous: { section: string; visits: number }[];
}) {
  const total = modules.reduce((sum, module) => sum + module.visits, 0);
  const max = modules[0]?.visits ?? 0;
  if (modules.length === 0) return <EmptyPanel />;
  return (
    <ol className="flex flex-col">
      {modules.slice(0, 12).map((module, index) => {
        const { name, icon: Icon } = moduleName(module.section);
        const before = previous.find(({ section }) => section === module.section)?.visits ?? 0;
        return (
          <li
            key={module.section}
            className="group grid grid-cols-[1.5rem_minmax(0,9rem)_1fr_auto] items-center gap-2 border-b border-pcnGreen-200/60 py-1.5 font-mono text-xs last:border-b-0"
            title={`${number(module.visitors)} visitantes únicos · ${number(module.members)} miembros`}
          >
            <span className="text-[10px] tabular-nums text-muted-foreground/60">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="flex min-w-0 items-center gap-1.5">
              {Icon && <Icon className="size-3.5 shrink-0 text-pcnGreen-600" aria-hidden />}
              <span className="truncate group-hover:text-pcnGreen">{name}</span>
            </span>
            <Bar value={module.visits} max={max} />
            <span className="flex w-28 items-center justify-end gap-2 text-[11px] tabular-nums">
              <span className="text-foreground">{number(module.visits)}</span>
              <span className="w-8 text-right text-muted-foreground/70">
                {percent((module.visits / total) * 100)}
              </span>
              <span className="w-12 text-right text-[10px]">
                <Delta current={module.visits} previous={before} />
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function TopPages({ pages }: { pages: PathCount[] }) {
  if (pages.length === 0) return <EmptyPanel />;
  const max = pages[0].visits;
  return (
    <table className="w-full font-mono text-xs">
      <thead>
        <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
          <th className="pb-1 font-normal">ruta</th>
          <th className="w-1/3 pb-1 font-normal" aria-label="Proporción" />
          <th className="pb-1 text-right font-normal">visitas</th>
          <th className="pb-1 text-right font-normal">únicos</th>
        </tr>
      </thead>
      <tbody>
        {pages.map((page) => (
          <tr key={page.path} className="group border-t border-pcnGreen-200/60">
            <td className="max-w-0 truncate py-1.5 pr-2">
              <Link href={page.path} className="text-muted-foreground hover:text-pcnGreen">
                <span className="text-pcnGreen-500">~</span>
                {page.path}
              </Link>
            </td>
            <td className="py-1.5 pr-3">
              <span className="flex">
                <Bar value={page.visits} max={max} />
              </span>
            </td>
            <td className="py-1.5 text-right tabular-nums text-foreground">
              {number(page.visits)}
            </td>
            <td className="py-1.5 pl-3 text-right tabular-nums text-muted-foreground">
              {number(page.visitors)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Each onboarding step as a bar sized against the first one, with the conversion from the step
 * before and how many people were lost there. The biggest leak is called out.
 */
export function SignupFunnel({ steps }: { steps: FunnelStep[] }) {
  const top = steps[0]?.count ?? 0;
  const losses = steps.map((step, index) =>
    index === 0 ? 0 : steps[index - 1].count - step.count,
  );
  const worst = losses.indexOf(Math.max(...losses));
  return (
    <div className="flex flex-col gap-3">
      <ol className="flex flex-col gap-2">
        {steps.map((step, index) => {
          const share = top > 0 ? (step.count / top) * 100 : 0;
          const fromPrevious =
            index > 0 && steps[index - 1].count > 0
              ? (step.count / steps[index - 1].count) * 100
              : null;
          return (
            <li key={step.id} className="font-mono">
              {index > 0 && losses[index] > 0 && (
                <p
                  className={cn(
                    'mb-1 flex items-center gap-1 pl-6 text-[10px]',
                    index === worst ? 'text-red-400' : 'text-muted-foreground/70',
                  )}
                >
                  <TrendingDown className="size-3" aria-hidden />
                  {number(losses[index])} se quedaron acá
                  {fromPrevious !== null && ` · pasa el ${percent(fromPrevious)}`}
                  {index === worst && ' · mayor fuga'}
                </p>
              )}
              <div
                className="group grid grid-cols-[1.25rem_1fr] items-center gap-2"
                title={step.hint}
              >
                <span className="text-[10px] tabular-nums text-muted-foreground/60">
                  {index + 1}.
                </span>
                <div className="relative h-8 overflow-hidden border border-pcnGreen-200 bg-pcnGreen-200/10">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-pcnGreen-700/70 to-pcnGreen/60 transition-[width] duration-700 group-hover:to-pcnGreen/80"
                    style={{ width: `${Math.max(share, step.count > 0 ? 1 : 0)}%` }}
                  />
                  <div className="relative flex h-full items-center justify-between gap-2 px-2 text-xs">
                    <span className="truncate text-foreground">{step.label}</span>
                    <span className="shrink-0 tabular-nums">
                      <span className="font-semibold text-foreground">{number(step.count)}</span>
                      <span className="ml-2 text-[10px] text-muted-foreground">
                        {percent(share)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="font-mono text-[10px] text-muted-foreground/70">
        <span className="text-pcnGreen-500">&gt; </span>
        de quienes se registraron en el período; los pasos se cumplen en orden
      </p>
    </div>
  );
}

const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
// Monday first, the way people read a week.
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** Visits by weekday and hour: one hue, darker to brighter as visits grow. */
export function HourHeatmap({ grid }: { grid: number[][] }) {
  const max = Math.max(1, ...grid.flat());
  const busiest = grid
    .flatMap((hours, dow) => hours.map((visits, hour) => ({ dow, hour, visits })))
    .sort((a, b) => b.visits - a.visits)[0];
  return (
    <figure className="flex flex-col gap-2">
      <div className="grid grid-cols-[2rem_repeat(24,minmax(0,1fr))] gap-[2px] font-mono text-[9px] text-muted-foreground">
        <span />
        {Array.from({ length: 24 }, (_, hour) => (
          <span key={hour} className="text-center tabular-nums">
            {hour % 3 === 0 ? hour : ''}
          </span>
        ))}
        {WEEK_ORDER.map((dow) => (
          <div key={dow} className="contents">
            <span className="self-center">{WEEKDAYS[dow]}</span>
            {grid[dow].map((visits, hour) => (
              <span
                key={hour}
                title={`${WEEKDAYS[dow]} ${hour}h · ${number(visits)} visitas`}
                className="h-4 rounded-[2px] border border-pcnGreen-200/40 transition-transform hover:scale-125 hover:border-pcnGreen sm:h-5"
                style={{
                  backgroundColor:
                    visits > 0 ? `rgba(4,244,190,${0.12 + (visits / max) * 0.88})` : undefined,
                  boxShadow: visits / max > 0.75 ? '0 0 8px rgba(4,244,190,0.6)' : undefined,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <figcaption className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
        <span>
          {busiest && busiest.visits > 0 && (
            <>
              pico:{' '}
              <span className="text-pcnGreen">
                {WEEKDAYS[busiest.dow]} {busiest.hour}h
              </span>{' '}
              ({number(busiest.visits)})
            </>
          )}
        </span>
        <span className="flex items-center gap-1">
          menos
          {[0.12, 0.35, 0.6, 0.85, 1].map((alpha) => (
            <span
              key={alpha}
              className="size-2 rounded-[1px]"
              style={{ backgroundColor: `rgba(4,244,190,${alpha})` }}
            />
          ))}
          más
        </span>
      </figcaption>
    </figure>
  );
}

export function RankedList({
  items,
  empty,
}: {
  items: { label: string; value: number }[];
  empty?: string;
}) {
  if (items.length === 0) return <EmptyPanel>{empty}</EmptyPanel>;
  const max = Math.max(...items.map(({ value }) => value));
  const total = items.reduce((sum, { value }) => sum + value, 0);
  return (
    <ul className="flex flex-col gap-1.5 font-mono text-xs">
      {items.map(({ label, value }) => (
        <li
          key={label}
          className="group grid grid-cols-[minmax(0,8rem)_1fr_auto] items-center gap-2"
        >
          <span className="truncate text-muted-foreground group-hover:text-pcnGreen">{label}</span>
          <Bar value={value} max={max} />
          <span className="w-20 text-right tabular-nums">
            <span className="text-foreground">{number(value)}</span>
            <span className="ml-1.5 text-[10px] text-muted-foreground/70">
              {percent((value / total) * 100)}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export const EmptyPanel = ({ children }: { children?: ReactNode }) => (
  <p className="py-6 text-center font-mono text-xs text-muted-foreground">
    <span className="text-pcnGreen-500">$ </span>
    {children ?? 'sin datos en este período'}
  </p>
);

export const Panel = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <section
    className={cn(ruledCellClassName, 'min-w-0 p-4 hover:bg-transparent', className)}
    {...props}
  />
);

export { RuledGrid };
