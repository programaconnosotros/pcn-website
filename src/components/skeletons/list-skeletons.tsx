import { Skeleton } from '@/components/ui/skeleton';
import { SearchBarSkeleton, TextLineSkeleton } from './page-skeletons';
import { cn } from '@/lib/utils';

// Loading-state pieces for list and admin pages: the filters row, stat cells, data tables and
// media rows.

/**
 * `CollapsibleFilters`: the search plus a `filtros` toggle on phones; from `md` up the search and
 * every filter (one `h-8` box per width in `filters`) share a wrapping row.
 */
export function FiltersRowSkeleton({
  filters = [],
  searchClassName,
  aside,
  className,
}: {
  filters?: string[];
  searchClassName?: string;
  /** Width of the status text pushed to the row's end (hidden on phones). */
  aside?: string;
  className?: string;
}) {
  return (
    <div
      className={cn('mb-4 flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center', className)}
    >
      <div className="flex items-center gap-2 md:contents">
        <div className="min-w-0 flex-1 md:contents">
          <SearchBarSkeleton className={searchClassName} />
        </div>
        <Skeleton className="h-8 w-20 shrink-0 md:hidden" />
      </div>
      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 max-md:hidden">
          {filters.map((width, i) => (
            <Skeleton key={i} className={cn('h-8', width)} />
          ))}
        </div>
      )}
      {aside && (
        <TextLineSkeleton
          lineClassName="h-4 max-md:hidden md:ml-auto"
          className={cn('h-3', aside)}
        />
      )}
    </div>
  );
}

/** A `label / value / hint` stat cell on a ruled grid. */
export function StatCellSkeleton({
  className = 'px-3 py-2.5',
  value = 'h-8',
}: {
  className?: string;
  /** Height of the value's line (`h-8` for `text-2xl`, `h-7` for `text-xl`). */
  value?: string;
}) {
  return (
    <div className={cn('border-r border-b border-pcnGreen-200', className)}>
      <TextLineSkeleton lineClassName="h-4" className="h-2.5 w-16" />
      <TextLineSkeleton lineClassName={value} className="h-5 w-12" />
      <TextLineSkeleton lineClassName="h-4" className="h-2.5 w-24" />
    </div>
  );
}

/** Rows of a bordered data table: an `h-8` header under a stronger rule, then dashed `h-9` rows. */
export function DataTableRowsSkeleton({
  rows = 10,
  columns,
}: {
  rows?: number;
  columns: string[];
}) {
  return (
    <div className="overflow-hidden">
      <div className="flex h-8 items-center gap-6 border-b border-pcnGreen-300 px-3">
        {columns.map((width, i) => (
          <Skeleton key={i} className={cn('h-2.5 shrink-0', width)} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="flex h-9 items-center gap-6 border-b border-dashed border-foreground/8 px-3"
        >
          {columns.map((width, i) => (
            <Skeleton key={i} className={cn('h-3 shrink-0', width)} />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * A ruled cell with a small image on the left (logo, poster) and the usual title row, two-line
 * description and `#` footer line on the right.
 */
export function MediaRowCellSkeleton({ media }: { media: string }) {
  return (
    <div className="flex gap-3 border-r border-b border-pcnGreen-200 p-3">
      <Skeleton className={cn('shrink-0 rounded-sm', media)} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex h-5 items-center gap-2">
          <Skeleton className="h-3.5 w-1/3" />
          <Skeleton className="ml-auto h-2.5 w-10" />
        </div>
        <TextLineSkeleton lineClassName="h-5" className="h-3 w-full" />
        <TextLineSkeleton lineClassName="h-5" className="h-3 w-2/3" />
        <TextLineSkeleton lineClassName="h-4" className="h-2.5 w-1/2" />
      </div>
    </div>
  );
}
