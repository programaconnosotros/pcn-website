const dayFormat = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'short',
  timeZone: 'America/Argentina/Buenos_Aires',
});

export type DailyCount = { day: Date; count: number };

/**
 * One bar per day, oldest first, with the exact count and date on hover. A single series, so
 * the heading names it and there is no legend; the peak and total sit in the caption.
 */
export function DailyBars({
  days,
  label,
  unit,
}: {
  days: DailyCount[];
  label: string;
  unit: string;
}) {
  const peak = Math.max(0, ...days.map((d) => d.count));
  // Scale against at least 1 so an all-zero month doesn't divide by zero.
  const max = Math.max(1, peak);
  const total = days.reduce((sum, d) => sum + d.count, 0);
  const today = days.at(-1)?.count ?? 0;

  return (
    <figure>
      <div
        role="img"
        aria-label={`${label}: ${total} ${unit} en ${days.length} días, máximo ${peak} en un día`}
        className="flex h-24 items-end gap-[2px] border-b border-pcnGreen-300"
      >
        {days.map(({ day, count }, index) => (
          <div key={day.toISOString()} className="group relative flex h-full flex-1 items-end">
            <div
              className={
                count > 0
                  ? `w-full rounded-t-[3px] transition-colors ${index === days.length - 1 ? 'bg-pcnGreen shadow-[0_0_10px_rgba(4,244,190,0.6)]' : 'bg-pcnGreen-600 group-hover:bg-pcnGreen'}`
                  : 'w-full bg-pcnGreen-100'
              }
              style={{ height: count > 0 ? `${Math.max(4, (count / max) * 100)}%` : '1px' }}
            />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap border border-pcnGreen-300 bg-background px-1.5 py-0.5 font-mono text-[11px] group-hover:block">
              <span className="text-pcnGreen">{count}</span> {unit} · {dayFormat.format(day)}
            </span>
          </div>
        ))}
      </div>
      <figcaption className="mt-1 flex justify-between font-mono text-[10px] tabular-nums text-muted-foreground">
        <span>{days[0] ? dayFormat.format(days[0].day) : ''}</span>
        <span>
          total <span className="text-foreground">{total}</span> · pico{' '}
          <span className="text-foreground">{peak}</span> · hoy{' '}
          <span className="text-pcnGreen">{today}</span>
        </span>
        <span>hoy</span>
      </figcaption>
    </figure>
  );
}
