import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Building blocks for loading.tsx files that mirror their page's real layout, so the swap from
// skeleton to content doesn't move anything.

/**
 * One line of text: a box as tall as the text's line height (`lineClassName`, `h-4` for
 * `text-xs`, `h-5` for `text-sm`) holding a shorter bar (`className`, `h-3` unless overridden), so
 * stacked lines keep the real text's rhythm.
 */
export function TextLineSkeleton({
  className,
  lineClassName = 'h-4',
}: {
  className?: string;
  lineClassName?: string;
}) {
  return (
    <div className={cn('flex items-center', lineClassName)}>
      <Skeleton className={cn('h-3', className)} />
    </div>
  );
}

/**
 * Mirrors PageTitle: the sidebar toggle (from `md` up) and the text-xl (`h-7`) `~/path` title on
 * the left; the meta line and the page's own controls (`action`) on the right, wrapping below it
 * on narrow screens.
 */
export function PageTitleSkeleton({
  titleClassName = 'w-40',
  meta = true,
  action,
  className,
}: {
  titleClassName?: string;
  /** `true` for the usual meta line, a width class for a custom one, `false` when there's none. */
  meta?: boolean | string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1', className)}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Skeleton className="-ml-1 h-7 w-8 shrink-0 max-md:hidden" />
        <TextLineSkeleton
          lineClassName="h-7 min-w-0"
          className={cn('h-5 max-w-full', titleClassName)}
        />
      </div>
      {(meta || action) && (
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
          {meta && <TextLineSkeleton className={cn('max-w-full', meta === true ? 'w-48' : meta)} />}
          {action}
        </div>
      )}
    </div>
  );
}

/** A small mono section label (`// radios`, `## logros`) over a block, with its `mb-2`. */
export function SectionLabelSkeleton({ className }: { className?: string }) {
  return <TextLineSkeleton lineClassName="mb-2 h-4" className={cn('h-2.5 w-32', className)} />;
}

/** Mirrors the `$ grep -i` SearchBar: bordered, `h-8`, up to `max-w-md` unless told otherwise. */
export function SearchBarSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-8 w-full max-w-md items-center rounded-sm border border-pcnGreen-200 px-2.5',
        className,
      )}
    >
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function RuledGridSkeleton({
  count = 6,
  className = 'grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3',
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`grid border-l border-t border-pcnGreen-200 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 border-b border-r border-pcnGreen-200 p-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-sm" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Mirrors CourseRow: the logo tile, then title, a short description and the source/author line.
export function CourseRowSkeleton() {
  return (
    <div className="flex gap-4 border-b border-r border-pcnGreen-200 p-4 sm:gap-3 sm:p-3">
      <Skeleton className="size-12 shrink-0 sm:size-10" />
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:gap-1.5">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <div className="flex gap-3 pt-1">
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-2.5 w-24" />
        </div>
      </div>
    </div>
  );
}
