import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HistoriaTimelineProps {
  children: ReactNode;
  className?: string;
}

/** Vertical rail that connects every `HistoriaSection` placed inside it. */
export function HistoriaTimeline({ children, className }: HistoriaTimelineProps) {
  return (
    <div
      className={cn(
        'relative space-y-14 before:absolute before:bottom-4 before:left-[7px] before:top-3 before:w-px before:bg-gradient-to-b before:from-border before:via-border before:to-transparent',
        className,
      )}
    >
      {children}
    </div>
  );
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
    <section id={id} className="relative scroll-mt-32 pl-8 sm:pl-12 lg:scroll-mt-28">
      <span
        aria-hidden
        className="absolute left-0 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-pcnPurple bg-background dark:border-pcnGreen dark:shadow-[0_0_10px_rgba(4,244,190,0.45)]"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-pcnPurple dark:bg-pcnGreen" />
      </span>
      <header className="mb-4 flex flex-col items-start gap-2">
        {period && (
          <span className="rounded-sm border border-pcnPurple/30 bg-pcnPurple/10 px-2.5 py-0.5 text-xs font-medium tabular-nums text-pcnPurple dark:border-pcnGreen/30 dark:bg-pcnGreen/10 dark:text-pcnGreen">
            {period}
          </span>
        )}
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
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
        'space-y-4 text-[15px] leading-7 text-muted-foreground [&_b]:font-semibold [&_b]:text-foreground',
        className,
      )}
    >
      {children}
    </div>
  );
}
