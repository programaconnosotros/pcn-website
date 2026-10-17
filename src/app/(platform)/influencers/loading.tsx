import { PageTitleSkeleton, TextLineSkeleton } from '@/components/skeletons/page-skeletons';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Mirrors the page: title, then the ruled grid of influencer rows (avatar, name with the platform
// icons, a two-line description and the specialties).
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-36" />
      </div>
      <RuledGrid className="mb-14 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className={cn(ruledCellClassName, 'flex gap-3 p-3')}>
            <Skeleton className="h-9 w-9 shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex h-5 items-center gap-2">
                <Skeleton className="h-3.5 w-1/2" />
                <div className="ml-auto flex shrink-0 gap-1.5">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-3.5 w-3.5" />
                  ))}
                </div>
              </div>
              <TextLineSkeleton lineClassName="h-5" className="w-full" />
              <TextLineSkeleton lineClassName="h-5" className="w-4/5" />
              <TextLineSkeleton className="h-2.5 w-2/3" />
            </div>
          </div>
        ))}
      </RuledGrid>
    </div>
  );
}
