import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HistoriaTimelineProps {
  children: ReactNode;
  className?: string;
}

/** Stacks every `HistoriaSection` placed inside it, separated by shared hairlines. */
export function HistoriaTimeline({ children, className }: HistoriaTimelineProps) {
  return <div className={cn('divide-y divide-pcnGreen-200', className)}>{children}</div>;
}

interface HistoriaSectionProps {
  id: string;
  title: string;
  /** Period shown above the title, e.g. "2017" or "2021 – 2024". */
  period?: string;
  children: ReactNode;
}

/** One entry of the history timeline: period badge, title and prose. */
export function HistoriaSection({ id, title, period, children }: HistoriaSectionProps) {
  return (
    <section id={id} className="scroll-mt-32 p-4 lg:scroll-mt-28">
      <header className="mb-3 flex items-baseline gap-3 font-mono">
        {period && <span className="shrink-0 text-xs tabular-nums text-pcnGreen">[{period}]</span>}
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      </header>
      <HistoriaProse>{children}</HistoriaProse>
    </section>
  );
}

/** Long-form text styles shared by the timeline entries and the introduction. */
export function HistoriaProse({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'space-y-3 text-sm leading-6 text-muted-foreground [&_b]:font-semibold [&_b]:text-foreground',
        className,
      )}
    >
      {children}
    </div>
  );
}
