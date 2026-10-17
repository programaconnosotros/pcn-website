import { PageTitleSkeleton, TextLineSkeleton } from '@/components/skeletons/page-skeletons';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { Skeleton } from '@/components/ui/skeleton';

// The greeting with its progress bar and the six first steps.
export default function Loading() {
  return (
    <div className="mt-4 px-4 md:px-10">
      <PageTitleSkeleton titleClassName="w-32" />

      <div className="mb-6 max-w-3xl space-y-3">
        <TextLineSkeleton lineClassName="h-4" className="h-2.5 w-48" />
        <Skeleton className="h-7 w-full max-w-xl" />
        <Skeleton className="h-4 w-full max-w-2xl" />
        <Skeleton className="h-3 w-56" />
      </div>

      <RuledGrid className="mb-14 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`${ruledCellClassName} flex flex-col gap-3 p-4`}>
            <div className="flex items-center gap-2">
              <Skeleton className="size-5" />
              <Skeleton className="h-3.5 w-36" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-8 w-32" />
          </div>
        ))}
      </RuledGrid>
    </div>
  );
}
