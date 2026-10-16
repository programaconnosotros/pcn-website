import {
  PageTitleSkeleton,
  SectionLabelSkeleton,
  TextLineSkeleton,
} from '@/components/skeletons/page-skeletons';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Mirrors the page: title, four KPI tiles and the ranked panels, two per row.
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4 mb-14">
        <PageTitleSkeleton titleClassName="w-36" />

        <RuledGrid className="mb-6 grid-cols-2 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn(ruledCellClassName, 'flex flex-col gap-1 p-3')}>
              <TextLineSkeleton className="h-2.5 w-2/3" />
              <TextLineSkeleton lineClassName="h-8" className="h-6 w-1/2" />
              <TextLineSkeleton className="h-2.5 w-1/3" />
            </div>
          ))}
        </RuledGrid>

        <RuledGrid className="mb-6 grid-cols-1 xl:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <section key={i} className={cn(ruledCellClassName, 'min-w-0 p-4')}>
              <SectionLabelSkeleton className="w-36" />
              {Array.from({ length: 6 }).map((_, row) => (
                <div key={row} className="flex items-center gap-2 py-1.5">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-1.5 flex-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </section>
          ))}
        </RuledGrid>
      </div>
    </div>
  );
}
