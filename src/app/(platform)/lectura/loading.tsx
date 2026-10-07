import { PageTitleSkeleton, TextLineSkeleton } from '@/components/skeletons/page-skeletons';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Mirrors the articles tab, the one the page opens on: title, the tabs + search + filters row
// (filters folded behind a toggle on phones), the terminal stats window, the category histogram
// and the auto-fill grid of article rows.
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mb-4 mt-4">
        <PageTitleSkeleton titleClassName="w-32" />
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
          <Skeleton className="h-8 w-48 shrink-0" />
          <div className="flex items-center gap-2 md:contents">
            <Skeleton className="h-8 min-w-0 flex-1" />
            <Skeleton className="h-8 w-24 shrink-0 md:hidden" />
          </div>
          <Skeleton className="h-8 w-56 max-md:hidden" />
        </div>

        <section className="mt-2 flex flex-col gap-3">
          <div className="border border-pcnGreen-200">
            <div className="flex items-center gap-2 border-b border-pcnGreen-200 px-3 py-1.5">
              <TextLineSkeleton className="h-2.5 w-40" />
            </div>
            <div className="px-3 py-2">
              <TextLineSkeleton className="w-80 max-w-full" />
            </div>
            <div className="flex items-center gap-4 border-t border-pcnGreen-200 px-3 py-2">
              <TextLineSkeleton className="h-2.5 w-48" />
              <Skeleton className="ml-auto h-8 w-56" />
            </div>
          </div>

          <div className="grid grid-cols-2 border-l border-t border-pcnGreen-200 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-0.5 border-b border-r border-pcnGreen-200 px-3 py-2"
              >
                <TextLineSkeleton className="h-2.5 w-2/3" />
                <Skeleton className="h-2 w-1/2" />
              </div>
            ))}
          </div>

          <RuledGrid className="grid-cols-[repeat(auto-fill,minmax(min(100%,22rem),1fr))]">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className={cn(ruledCellClassName, 'flex gap-3 p-3')}>
                <div className="flex shrink-0 flex-col items-center gap-1.5">
                  <Skeleton className="size-10" />
                  <Skeleton className="h-2.5 w-6" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex h-4 items-center gap-2">
                    <Skeleton className="h-3.5 w-20" />
                    <Skeleton className="ml-auto h-2.5 w-16" />
                  </div>
                  <TextLineSkeleton lineClassName="h-5" className="h-3.5 w-11/12" />
                  <TextLineSkeleton lineClassName="h-5" className="w-full" />
                  <TextLineSkeleton lineClassName="h-5" className="w-3/4" />
                  <TextLineSkeleton lineClassName="h-5 pt-0.5" className="h-2.5 w-1/2" />
                </div>
              </div>
            ))}
          </RuledGrid>
        </section>
      </div>
    </div>
  );
}
