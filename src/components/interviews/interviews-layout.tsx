import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/**
 * The interview pages' two-column layout: the main content fills the width and a side panel
 * sticks next to it on large screens (below it on small ones).
 */
export const InterviewsLayout = ({ main, aside }: { main: ReactNode; aside: ReactNode }) => (
  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
    <div className="min-w-0">{main}</div>
    <aside className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">{aside}</aside>
  </div>
);

/** A bordered side panel headed by a terminal prompt, e.g. `$ cat entrevista.conf`. */
export const InterviewsPanel = ({
  command,
  meta,
  children,
  className,
}: {
  command: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <section className={cn('border border-pcnGreen-200 font-mono', className)}>
    <header className="flex items-center gap-2 border-b border-pcnGreen-200 bg-pcnGreen/[0.03] px-3 py-2 text-[11px] text-muted-foreground">
      <span className="truncate">
        <span className="text-pcnGreen-500">$ </span>
        {command}
      </span>
      {meta && <span className="ml-auto shrink-0 tabular-nums">{meta}</span>}
    </header>
    <div className="p-3">{children}</div>
  </section>
);
