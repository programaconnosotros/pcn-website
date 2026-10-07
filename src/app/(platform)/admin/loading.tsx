import { StatCellSkeleton } from '@/components/skeletons/list-skeletons';
import { PageTitleSkeleton, TextLineSkeleton } from '@/components/skeletons/page-skeletons';
import { RuledGrid } from '@/components/ui/ruled-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const PanelSkeleton = ({ children, className }: { children: ReactNode; className?: string }) => (
  <section className={cn('min-w-0 border border-pcnGreen-200', className)}>
    <div className="flex items-center gap-3 border-b border-pcnGreen-200 px-3 py-1.5">
      <TextLineSkeleton lineClassName="h-4" className="h-2.5 w-16" />
      <Skeleton className="h-2.5 w-40" />
      <Skeleton className="ml-auto h-2.5 w-8" />
    </div>
    <div className="p-3">{children}</div>
  </section>
);

// Daily bars over the last 30 days, with the caption under them.
const BarsSkeleton = () => (
  <>
    <div className="flex h-24 items-end gap-[2px] border-b border-pcnGreen-300">
      {Array.from({ length: 30 }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1 rounded-none"
          style={{ height: `${15 + ((i * 41) % 80)}%` }}
        />
      ))}
    </div>
    <TextLineSkeleton lineClassName="mt-1 h-4" className="h-2 w-full" />
  </>
);

const RowsSkeleton = () => (
  <div className="-mx-3 -my-3 divide-y divide-pcnGreen-200/60">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex h-[1.875rem] items-center gap-2 px-3">
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-3 flex-1" />
        <Skeleton className="h-3 w-12" />
      </div>
    ))}
  </div>
);

// The six KPIs and the dashboard panels: traffic and sign-up bars, then the lists.
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-24" />

        <RuledGrid className="mb-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCellSkeleton key={i} />
          ))}
        </RuledGrid>

        <div className="mb-14 grid gap-4 xl:grid-cols-2">
          <PanelSkeleton>
            <BarsSkeleton />
          </PanelSkeleton>
          <PanelSkeleton>
            <BarsSkeleton />
          </PanelSkeleton>
          <PanelSkeleton>
            <RowsSkeleton />
          </PanelSkeleton>
          <PanelSkeleton>
            <RowsSkeleton />
          </PanelSkeleton>
        </div>
      </div>
    </div>
  );
}
