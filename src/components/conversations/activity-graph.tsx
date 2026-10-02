import { cn } from '@/lib/utils';

export interface MonthActivity {
  /** `YYYY-MM` */
  key: string;
  total: number;
  matches: number;
}

// A commit-graph style histogram: one bar per month, the dim bar is every conversation that
// month and the lit bar is how many of them pass the current filters. Bars link to their month.
export function ActivityGraph({ months }: { months: MonthActivity[] }) {
  const max = Math.max(1, ...months.map((month) => month.total));

  return (
    <div className="border border-pcnGreen-200 bg-black/40 p-3 font-mono">
      <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          <span className="text-pcnGreen-600">$ </span>git log --since=
          <span className="text-pcnGreen">{months[0]?.key}</span> | histogram
        </span>
        <span className="max-sm:hidden">max {max}/mes</span>
      </div>
      <div className="flex h-20 items-end gap-0.5 sm:gap-1">
        {months.map((month) => {
          const hasMatches = month.matches > 0;
          return (
            <a
              key={month.key}
              href={hasMatches ? `#m-${month.key}` : undefined}
              aria-disabled={!hasMatches}
              title={`${month.key}: ${month.matches}/${month.total} conversaciones`}
              className={cn(
                'group relative flex h-full flex-1 items-end',
                hasMatches ? 'cursor-pointer' : 'cursor-default',
              )}
            >
              <span
                className="absolute bottom-0 w-full bg-pcnGreen-100"
                style={{ height: `${(month.total / max) * 100}%` }}
              />
              <span
                className={cn(
                  'relative w-full bg-pcnGreen-600 transition-colors',
                  hasMatches &&
                    'group-hover:bg-pcnGreen group-hover:shadow-[0_0_10px_rgba(4,244,190,0.7)]',
                )}
                style={{ height: `${(month.matches / max) * 100}%` }}
              />
            </a>
          );
        })}
      </div>
      <div className="mt-1 flex gap-0.5 text-[9px] tabular-nums text-muted-foreground/70 sm:gap-1">
        {months.map((month) => {
          const [year, monthNumber] = month.key.split('-');
          const showYear = monthNumber === '01' || month === months[0];
          return (
            <span key={month.key} className="flex-1 text-center">
              {showYear ? <span className="text-pcnGreen-600">{year.slice(2)}</span> : monthNumber}
            </span>
          );
        })}
      </div>
    </div>
  );
}
