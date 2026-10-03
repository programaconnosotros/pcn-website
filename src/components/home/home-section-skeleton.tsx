import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * Placeholder for a home section whose data is still loading: the section header (eyebrow,
 * title, description) over a ruled grid of `cells` blocks `cellClassName` tall.
 */
export const HomeSectionSkeleton = ({
  cells = 4,
  gridClassName = 'grid-cols-2 sm:grid-cols-4',
  cellClassName = 'h-40',
}: {
  cells?: number;
  gridClassName?: string;
  cellClassName?: string;
}) => (
  <section aria-hidden>
    <div className="mb-5 flex flex-col gap-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-72 max-w-full" />
      <Skeleton className="h-4 w-96 max-w-full" />
    </div>
    <div className={cn('grid border-l border-t border-pcnGreen-200', gridClassName)}>
      {Array.from({ length: cells }).map((_, i) => (
        <div key={i} className="border-b border-r border-pcnGreen-200 p-1">
          <Skeleton className={cn('w-full rounded-none', cellClassName)} />
        </div>
      ))}
    </div>
  </section>
);
