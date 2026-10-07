import {
  PageTitleSkeleton,
  SectionLabelSkeleton,
  TextLineSkeleton,
} from '@/components/skeletons/page-skeletons';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// The hexagon of `BadgeMedal`, so the placeholder medals have the real ones' outline.
const HEX = '[clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0_75%,0_25%)]';

// Mirrors the page: title, the viewer's progress banner (with its strip of small medals), then
// the `## logros` grid of badge rows (medal, name, description, how-to and holders).
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-28" meta="w-80" />

        <RuledGrid className="mb-8 grid-cols-1 md:grid-cols-[1fr_auto]">
          <div className={cn(ruledCellClassName, 'p-4')}>
            <TextLineSkeleton className="w-48" />
            <TextLineSkeleton lineClassName="mt-2 h-5" className="h-3.5 w-56" />
            <TextLineSkeleton lineClassName="mt-1 h-4" className="w-2/3" />
          </div>
          <div
            className={cn(
              ruledCellClassName,
              'flex items-center justify-center gap-1 p-4 md:min-w-64',
            )}
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className={cn('h-[25px] w-[22px] rounded-none', HEX)} />
            ))}
          </div>
        </RuledGrid>

        <section className="mb-8">
          <SectionLabelSkeleton className="w-24" />
          <RuledGrid className="grid-cols-1 lg:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={cn(ruledCellClassName, 'flex gap-4 p-4')}>
                <Skeleton className={cn('h-[69px] w-[60px] shrink-0 rounded-none', HEX)} />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div>
                    <div className="flex h-5 items-center justify-between gap-2">
                      <Skeleton className="h-3.5 w-1/3" />
                      <Skeleton className="h-3.5 w-3.5" />
                    </div>
                    <TextLineSkeleton lineClassName="h-5" className="w-11/12" />
                  </div>
                  <TextLineSkeleton className="h-2.5 w-3/4" />
                  <TextLineSkeleton className="h-2.5 w-1/2" />
                  <div className="flex gap-1">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <Skeleton key={j} className="size-6" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </RuledGrid>
        </section>
      </div>
    </div>
  );
}
