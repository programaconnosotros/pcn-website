import {
  PageTitleSkeleton,
  SectionLabelSkeleton,
  TextLineSkeleton,
} from '@/components/skeletons/page-skeletons';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Mirrors the page: its wider gutters, the title with the "sumate" link, then the companies and
// the organizations as ruled grids of centered logo cells.
const GROUPS = [9, 6];

export default function Loading() {
  return (
    <div className="-mx-1 px-6 md:-mx-6 md:px-10">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-32" meta="w-40" />
        <div className="pb-10">
          {GROUPS.map((count, group) => (
            <section key={group} className={cn(group > 0 && 'mt-8')}>
              <SectionLabelSkeleton className="w-28" />
              <RuledGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: count }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(ruledCellClassName, 'flex flex-col items-center gap-2 p-4')}
                  >
                    <div className="flex h-16 w-full items-center justify-center">
                      <Skeleton className="h-9 w-32" />
                    </div>
                    <TextLineSkeleton className="w-4/5" />
                    <TextLineSkeleton className="w-3/5" />
                    <TextLineSkeleton lineClassName="mt-auto h-5 pt-1" className="h-2.5 w-24" />
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
