import { PageTitleSkeleton } from '@/components/skeletons/page-skeletons';
import { RuledGrid } from '@/components/ui/ruled-grid';
import { Skeleton } from '@/components/ui/skeleton';

const cell = 'border-b border-r border-pcnGreen-200 p-3';

const SectionLabel = () => (
  <div className="mb-2 mt-6 flex h-4 items-center">
    <Skeleton className="h-2.5 w-28" />
  </div>
);

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-36" />

        {/* 16 stat cells: label + icon, the number and its description. */}
        <RuledGrid className="grid-cols-2 md:grid-cols-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className={cell}>
              <div className="flex h-4 items-center justify-between gap-2">
                <Skeleton className="h-2.5 w-24" />
                <Skeleton className="size-3.5 shrink-0" />
              </div>
              <div className="mt-1 flex h-8 items-center">
                <Skeleton className="h-6 w-12" />
              </div>
              <div className="flex h-4 items-center">
                <Skeleton className="h-2.5 w-20" />
              </div>
            </div>
          ))}
        </RuledGrid>

        <SectionLabel />
        <RuledGrid className="grid-cols-1 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={cell}>
              <Skeleton className="h-3.5 w-36" />
              <div className="mt-2 space-y-1.5">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-5/6" />
                <Skeleton className="h-3.5 w-2/3" />
              </div>
              <Skeleton className="mt-2 h-2.5 w-16" />
            </div>
          ))}
        </RuledGrid>

        <SectionLabel />
        {/* Users table: header row, then one row per user. */}
        <div className="mb-14 border border-pcnGreen-200">
          {Array.from({ length: 9 }).map((_, row) => (
            <div
              key={row}
              className={
                row === 0
                  ? 'flex h-[33px] items-center gap-6 border-b border-pcnGreen-200 px-3'
                  : 'flex h-8 items-center gap-6 border-b border-pcnGreen-200 px-3 last:border-b-0'
              }
            >
              <Skeleton className={row === 0 ? 'h-2.5 w-14' : 'h-3.5 w-28'} />
              <Skeleton className={row === 0 ? 'h-2.5 w-12' : 'h-3 w-44'} />
              <Skeleton
                className={row === 0 ? 'h-2.5 w-14 max-sm:hidden' : 'h-3.5 w-40 max-sm:hidden'}
              />
              <Skeleton
                className={row === 0 ? 'h-2.5 w-10 max-md:hidden' : 'h-3.5 w-20 max-md:hidden'}
              />
              <Skeleton className={row === 0 ? 'ml-auto h-2.5 w-16' : 'ml-auto h-3 w-20'} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
