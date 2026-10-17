import { PageTitleSkeleton, TextLineSkeleton } from '@/components/skeletons/page-skeletons';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Mirrors the page: title, the search with the section links and the member count (folded
// behind a toggle on phones), then the sections, each a `> título ───── [n]` heading over a
// ruled grid of member rows.
const SECTIONS = [3, 9];

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-32" />
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
          <div className="flex items-center gap-2 md:contents">
            <div className="min-w-0 flex-1 md:contents">
              <Skeleton className="h-8 w-full max-w-md" />
            </div>
            <Skeleton className="h-8 w-28 shrink-0 md:hidden" />
          </div>
          <TextLineSkeleton lineClassName="h-4 max-md:hidden" className="w-72" />
          <TextLineSkeleton lineClassName="h-4 max-md:hidden md:ml-auto" className="w-24" />
        </div>

        <div className="mb-14 space-y-6">
          {SECTIONS.map((count, section) => (
            <section key={section}>
              <div className="flex h-4 items-center gap-2">
                <Skeleton className="h-3 w-28" />
                <span className="h-px flex-1 bg-pcnGreen-200" />
                <Skeleton className="h-3 w-6" />
              </div>
              <TextLineSkeleton lineClassName="mb-2 mt-1 h-4" className="w-64 max-w-full" />
              <RuledGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: count }).map((_, i) => (
                  <div key={i} className={cn(ruledCellClassName, 'flex min-w-0 gap-3 p-3')}>
                    <Skeleton className="size-9 shrink-0" />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <TextLineSkeleton lineClassName="h-5" className="h-3.5 w-1/2" />
                      <TextLineSkeleton className="w-2/3" />
                      <TextLineSkeleton className="h-2.5 w-1/3" />
                    </div>
                  </div>
                ))}
              </RuledGrid>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
