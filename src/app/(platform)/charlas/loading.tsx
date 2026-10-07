import { PageTitleSkeleton } from '@/components/skeletons/page-skeletons';
import { RuledGrid } from '@/components/ui/ruled-grid';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        {/* Title with its meta, and the `quiero dar una charla` link. */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <PageTitleSkeleton titleClassName="w-32" className="mb-0 flex-1" />
          <Skeleton className="h-4 w-36" />
        </div>

        {/* Comunidad / Externas tabs. */}
        <Skeleton className="mb-4 h-7 w-44 rounded-none" />

        {/* Search and the video/slides filter, on a bar that sits on top of the grid. */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-x border-t border-pcnGreen-200 bg-black/60 px-3 py-2">
          <Skeleton className="h-8 max-w-sm flex-1" />
          <Skeleton className="ml-auto h-8 w-48 rounded-none" />
        </div>

        {/* The latest year's heading, then its talks. */}
        <div className="flex h-[29px] items-center gap-3 border-x border-t border-pcnGreen-200 px-3">
          <Skeleton className="h-3 w-16" />
          <div className="h-px flex-1 bg-pcnGreen-200 opacity-60" />
          <Skeleton className="h-3 w-16" />
        </div>
        <RuledGrid className="mb-14 grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-2.5 border-b border-r border-pcnGreen-200 p-3"
            >
              <Skeleton className="aspect-square w-full" />
              <div className="space-y-1.5 py-0.5">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-1/2" />
              </div>
              <div className="flex flex-col gap-1.5 py-0.5">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="size-4 rounded-full" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
                <Skeleton className="h-2.5 w-32" />
                <Skeleton className="h-2.5 w-28" />
              </div>
              <div className="mt-auto flex gap-1.5">
                <Skeleton className="h-[22px] w-14" />
                <Skeleton className="h-[22px] w-16" />
              </div>
            </div>
          ))}
        </RuledGrid>
      </div>
    </div>
  );
}
