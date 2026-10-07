import { FiltersRowSkeleton } from '@/components/skeletons/list-skeletons';
import { PageTitleSkeleton, TextLineSkeleton } from '@/components/skeletons/page-skeletons';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Search and filters, the stats and monthly histogram (from md up; phones keep them in the filters
// sheet), the frequent voices and the first month of conversation cards.
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-44" />
        <FiltersRowSkeleton filters={['w-52']} aside="w-24" />

        <div className="max-md:hidden">
          <div className="mb-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <RuledGrid className="grid-cols-2 self-start sm:grid-cols-4 xl:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-0.5 border-b border-r border-pcnGreen-200 px-3 py-2"
                >
                  <TextLineSkeleton lineClassName="h-[15px]" className="h-2.5 w-16" />
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </RuledGrid>
            <div className="border border-pcnGreen-200 p-3">
              <TextLineSkeleton lineClassName="mb-2 h-4" className="h-2.5 w-56" />
              <div className="flex h-20 items-end gap-0.5 sm:gap-1">
                {Array.from({ length: 24 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="flex-1 rounded-none"
                    style={{ height: `${25 + ((i * 37) % 70)}%` }}
                  />
                ))}
              </div>
              <TextLineSkeleton lineClassName="mt-1 h-3.5" className="h-2 w-full" />
            </div>
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-1">
            <Skeleton className="mr-1 h-3 w-28" />
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className={cn('h-[22px]', i % 2 ? 'w-24' : 'w-20')} />
            ))}
          </div>
        </div>

        <div className="mb-14 space-y-6">
          <section>
            <div className="mb-2 flex h-4 items-center gap-2">
              <Skeleton className="h-3 w-32" />
              <span aria-hidden className="h-px flex-1 bg-pcnGreen-200" />
              <Skeleton className="h-3 w-10" />
            </div>
            <RuledGrid className="grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className={cn(ruledCellClassName, 'flex flex-col gap-1.5 p-3')}>
                  <div className="flex h-4 items-center gap-2">
                    <Skeleton className="h-2.5 w-20" />
                    <Skeleton className="ml-auto h-2 w-16" />
                  </div>
                  <TextLineSkeleton lineClassName="h-5" className="h-3.5 w-3/4" />
                  <div>
                    <TextLineSkeleton lineClassName="h-5" className="h-3 w-full" />
                    <TextLineSkeleton lineClassName="h-5" className="h-3 w-full" />
                    <TextLineSkeleton lineClassName="h-5" className="h-3 w-1/2" />
                  </div>
                  <div className="flex gap-1 pt-1">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-14" />
                  </div>
                </div>
              ))}
            </RuledGrid>
          </section>
        </div>
      </div>
    </div>
  );
}
