import { DataTableRowsSkeleton, StatCellSkeleton } from '@/components/skeletons/list-skeletons';
import { PageTitleSkeleton, TextLineSkeleton } from '@/components/skeletons/page-skeletons';
import { RuledGrid } from '@/components/ui/ruled-grid';
import { Skeleton } from '@/components/ui/skeleton';

const SectionHeaderSkeleton = ({ width }: { width: string }) => (
  <div className="border-b border-pcnGreen-200 px-3 py-2">
    <TextLineSkeleton lineClassName="h-4" className={`h-2.5 ${width}`} />
  </div>
);

// The four stats, the top pages with their bars and the table of recent visits.
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-28" />

        <RuledGrid className="mb-4 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCellSkeleton key={i} className="p-3" value="mt-1 h-8" />
          ))}
        </RuledGrid>

        <section className="mb-4 border border-pcnGreen-200">
          <SectionHeaderSkeleton width="w-44" />
          <div className="divide-y divide-pcnGreen-200/60">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex h-6 items-center gap-3 px-3">
                <Skeleton className="h-2.5 w-5" />
                <Skeleton className="h-3 w-32 shrink-0 sm:w-48" />
                <Skeleton className="h-1.5 flex-1" style={{ maxWidth: `${100 - i * 9}%` }} />
                <Skeleton className="ml-auto h-3 w-10" />
              </div>
            ))}
          </div>
        </section>

        <section className="mb-14 border border-pcnGreen-200">
          <SectionHeaderSkeleton width="w-56" />
          <DataTableRowsSkeleton rows={8} columns={['w-32', 'w-28', 'w-40', 'w-32']} />
        </section>
      </div>
    </div>
  );
}
