import {
  PageTitleSkeleton,
  SearchBarSkeleton,
  TextLineSkeleton,
} from '@/components/skeletons/page-skeletons';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// The video grid: its bordered toolbar (search, progress, language and watched filters) sitting
// on top of the ruled grid of 16:9 thumbnails with title and byline.
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mb-14 mt-4">
        <PageTitleSkeleton titleClassName="w-28" />

        <div className="flex flex-col gap-2 border border-b-0 border-pcnGreen-200 px-3 py-2 md:flex-row md:flex-wrap md:items-center md:gap-x-4">
          <div className="flex items-center gap-2 md:contents">
            <div className="min-w-0 flex-1 md:contents">
              <SearchBarSkeleton className="max-w-sm flex-1 basis-full sm:basis-auto" />
            </div>
            <Skeleton className="h-8 w-20 shrink-0 md:hidden" />
          </div>
          <div className="flex flex-wrap items-center gap-2 max-md:hidden md:flex-1 md:gap-x-4">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="ml-auto h-8 w-32" />
            <Skeleton className="h-8 w-40" />
          </div>
        </div>

        <RuledGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={cn(ruledCellClassName, 'flex flex-col gap-2 p-3')}>
              <Skeleton className="aspect-video w-full" />
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <TextLineSkeleton lineClassName="h-4" className="h-3 w-full" />
                  <TextLineSkeleton lineClassName="h-4" className="h-3 w-2/3" />
                </div>
                <TextLineSkeleton lineClassName="h-4" className="h-2.5 w-14" />
              </div>
              <div className="flex h-5 items-center gap-2">
                <Skeleton className="h-2.5 w-1/2" />
                <Skeleton className="ml-auto h-4 w-12" />
              </div>
            </div>
          ))}
        </RuledGrid>
      </div>
    </div>
  );
}
