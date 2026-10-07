import { PageTitleSkeleton } from '@/components/skeletons/page-skeletons';
import { RuledGrid } from '@/components/ui/ruled-grid';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-36" />

        {/* `$ grep` plus tema / autor / origen / orden, folded behind a toggle on phones. */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Skeleton className="h-8 min-w-0 flex-1 md:w-56 md:flex-none" />
          <Skeleton className="h-8 w-24 shrink-0 md:hidden" />
          <Skeleton className="h-8 w-[150px] max-md:hidden" />
          <Skeleton className="h-8 w-[170px] max-md:hidden" />
          <Skeleton className="h-8 w-40 max-md:hidden" />
          <Skeleton className="h-8 w-[170px] max-md:hidden" />
          <Skeleton className="ml-auto h-3 w-24 max-md:hidden" />
        </div>

        {/* Stats beside the consejo of the day. */}
        <div className="mb-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <RuledGrid className="grid-cols-2 self-start sm:grid-cols-4 xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-1.5 border-b border-r border-pcnGreen-200 px-3 py-2"
              >
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </RuledGrid>
          <div className="flex flex-col gap-3 border border-pcnGreen-200 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-2.5 w-36" />
              <Skeleton className="h-2.5 w-14" />
            </div>
            <div className="space-y-2.5 py-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-3/5" />
            </div>
            <Skeleton className="h-2.5 w-28" />
          </div>
        </div>

        {/* Consejo cards: hash, date and likes, the text and its author. */}
        <RuledGrid className="mb-14 grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-2.5 border-b border-r border-pcnGreen-200 p-3"
            >
              <div className="flex h-6 items-center gap-2">
                <Skeleton className="h-2.5 w-14" />
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="ml-auto h-4 w-8" />
              </div>
              <div className="flex-1 space-y-2.5 py-1">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-2/3" />
              </div>
              <div className="flex items-center gap-1.5">
                <Skeleton className="size-5" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </RuledGrid>
      </div>
    </div>
  );
}
