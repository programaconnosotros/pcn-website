import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface PageTitleProps {
  path: string;
  meta?: ReactNode;
  className?: string;
}

// Compact terminal-style page title: `~/path` on the left, a one-line summary on the right.
export const PageTitle = ({ path, meta, className }: PageTitleProps) => (
  <div
    className={cn(
      'mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono',
      className,
    )}
  >
    <h1 className="text-xl font-semibold tracking-tight">
      <span className="text-pcnGreen-500">~/</span>
      {path}
      <span className="ml-1 inline-block h-[1.1em] w-2 translate-y-[0.15em] animate-pulse bg-pcnGreen" />
    </h1>
    {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
  </div>
);
