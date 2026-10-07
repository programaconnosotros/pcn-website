import { DataTableRowsSkeleton, StatCellSkeleton } from '@/components/skeletons/list-skeletons';
import {
  PageTitleSkeleton,
  SearchBarSkeleton,
  TextLineSkeleton,
} from '@/components/skeletons/page-skeletons';
import { RuledGrid } from '@/components/ui/ruled-grid';
import { Skeleton } from '@/components/ui/skeleton';

// The users table: search with the count and `--columnas`, the five stats, then the table.
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-32" />
        <div className="mb-3 flex items-center gap-2 sm:gap-3">
          <SearchBarSkeleton className="max-w-none flex-1" />
          <div className="flex shrink-0 items-center gap-2">
            <TextLineSkeleton lineClassName="h-4" className="h-3 w-10" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>

        <RuledGrid className="mb-4 grid-cols-2 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <StatCellSkeleton key={i} className="px-3 py-2" value="h-7" />
          ))}
        </RuledGrid>

        <div className="mb-14 border border-pcnGreen-200">
          <DataTableRowsSkeleton
            rows={12}
            columns={['w-44', 'w-48', 'w-14', 'w-14', 'w-16', 'w-24', 'w-24', 'w-32']}
          />
        </div>
      </div>
    </div>
  );
}
