import {
  PageTitleSkeleton,
  SectionLabelSkeleton,
  TextLineSkeleton,
} from '@/components/skeletons/page-skeletons';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// A `// errores` / `// logs` group of stat tiles.
const StatGroupSkeleton = ({ tiles, className }: { tiles: number; className: string }) => (
  <section className="mb-4">
    <SectionLabelSkeleton className="w-16" />
    <RuledGrid className={cn('grid-cols-2', className)}>
      {Array.from({ length: tiles }).map((_, i) => (
        <div key={i} className={cn(ruledCellClassName, 'p-3')}>
          <div className="flex h-4 items-center justify-between gap-2">
            <Skeleton className="h-2.5 w-2/3" />
            <Skeleton className="h-3.5 w-3.5" />
          </div>
          <TextLineSkeleton lineClassName="mt-1 h-8" className="h-6 w-16" />
          <TextLineSkeleton className="h-2.5 w-1/2" />
        </div>
      ))}
    </RuledGrid>
  </section>
);

// Mirrors the page: title, the error and log stat groups, the errores/logs tabs and the errors
// panel (section bar, status flags and the table).
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-40" />

        <StatGroupSkeleton tiles={4} className="md:grid-cols-4" />
        <StatGroupSkeleton tiles={5} className="md:grid-cols-5" />

        <Skeleton className="h-7 w-56" />
        <section className="mt-3 min-w-0 border border-pcnGreen-200">
          <div className="flex items-center gap-3 border-b border-pcnGreen-200 px-3 py-2">
            <TextLineSkeleton className="w-48" />
            <TextLineSkeleton lineClassName="ml-auto h-4" className="w-32" />
          </div>
          <div className="border-b border-pcnGreen-200 px-3 py-2">
            <Skeleton className="h-7 w-64" />
          </div>
          <div className="flex h-8 items-center gap-4 border-b border-pcnGreen-300 px-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-2.5 flex-1" />
            ))}
          </div>
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex h-9 items-center gap-4 border-b border-dashed border-foreground/[0.08] px-3 last:border-b-0"
            >
              <Skeleton className="h-3 w-3 shrink-0" />
              <Skeleton className="h-3 w-20 shrink-0" />
              <Skeleton className="h-3 w-24 shrink-0" />
              <Skeleton className="h-3 flex-1" />
              <Skeleton className="h-3 w-32 shrink-0 max-sm:hidden" />
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
