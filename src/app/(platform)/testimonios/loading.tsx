import { PageTitleSkeleton, TextLineSkeleton } from '@/components/skeletons/page-skeletons';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Title and the ruled grid of testimonials: avatar and name, then the quote.
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-36" />
        <RuledGrid className="mb-14 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={cn(ruledCellClassName, 'flex flex-col gap-2 p-3')}>
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7 shrink-0" />
                <Skeleton className="h-3.5 w-32" />
              </div>
              <div>
                <TextLineSkeleton lineClassName="h-5" className="h-3 w-full" />
                <TextLineSkeleton lineClassName="h-5" className="h-3 w-full" />
                <TextLineSkeleton
                  lineClassName="h-5"
                  className={i % 2 ? 'h-3 w-1/2' : 'h-3 w-5/6'}
                />
              </div>
            </div>
          ))}
        </RuledGrid>
      </div>
    </div>
  );
}
