import { FiltersRowSkeleton, StatCellSkeleton } from '@/components/skeletons/list-skeletons';
import { PageTitleSkeleton, TextLineSkeleton } from '@/components/skeletons/page-skeletons';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Title with the publish button, search and stack flags, the four stats and the project cards:
// header line, app-icon logo beside title and description, tech chips and the people footer.
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <PageTitleSkeleton titleClassName="w-36" className="flex-1" />
          <Skeleton className="h-8 w-44" />
        </div>
        <FiltersRowSkeleton filters={['w-32', 'w-24', 'w-20', 'w-24', 'w-20', 'w-24']} />

        <div className="mb-6">
          <TextLineSkeleton lineClassName="mb-2 h-4" className="h-3 w-64 max-w-full" />
          <RuledGrid className="grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCellSkeleton key={i} />
            ))}
          </RuledGrid>
        </div>

        <RuledGrid className="mb-14 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={cn(ruledCellClassName, 'flex flex-col gap-3 p-4')}>
              <div className="flex h-4 items-center gap-2">
                <Skeleton className="h-2.5 w-6" />
                <Skeleton className="h-2.5 w-32" />
              </div>
              <div className="flex items-start gap-3">
                <Skeleton className="size-14 shrink-0 rounded-[22%]" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <TextLineSkeleton lineClassName="h-[1.375rem]" className="h-4 w-1/2" />
                  <div>
                    <TextLineSkeleton lineClassName="h-5" className="h-3 w-full" />
                    <TextLineSkeleton lineClassName="h-5" className="h-3 w-full" />
                    <TextLineSkeleton lineClassName="h-5" className="h-3 w-2/3" />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {['w-14', 'w-16', 'w-12', 'w-20'].map((width, j) => (
                  <Skeleton key={j} className={cn('h-[22px]', width)} />
                ))}
              </div>
              <div className="mt-auto flex items-center gap-3 border-t border-dashed border-pcnGreen-200 pt-3">
                <Skeleton className="size-6 shrink-0" />
                <Skeleton className="h-2.5 w-24" />
                <Skeleton className="ml-auto h-6 w-16" />
              </div>
            </div>
          ))}
        </RuledGrid>
      </div>
    </div>
  );
}
