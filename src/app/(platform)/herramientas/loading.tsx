import { Skeleton } from '@/components/ui/skeleton';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { TabStripSkeleton } from '@/components/skeletons/event-skeletons';
import { PageTitleSkeleton, SearchBarSkeleton } from '@/components/skeletons/page-skeletons';
import { cn } from '@/lib/utils';

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-40" meta="w-72" />
        <TabStripSkeleton tabs={['w-8', 'w-14', 'w-16']} className="mb-4" />
        <SearchBarSkeleton className="mb-4" />

        {/* Mirrors SoftwareRecommendationCard: logo, name and pricing, two lines and the tags. */}
        <RuledGrid className="mt-2 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={cn(ruledCellClassName, 'flex gap-3 p-3')}>
              <Skeleton className="h-9 w-9 shrink-0" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex h-5 items-center gap-2">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="ml-auto h-3 w-14" />
                </div>
                <div className="flex h-10 flex-col justify-around">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <div className="flex h-4 items-center">
                  <Skeleton className="h-2.5 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </RuledGrid>
      </div>
    </div>
  );
}
