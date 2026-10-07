import { FiltersRowSkeleton, MediaRowCellSkeleton } from '@/components/skeletons/list-skeletons';
import { PageTitleSkeleton } from '@/components/skeletons/page-skeletons';
import { RuledGrid } from '@/components/ui/ruled-grid';

// Title, the search with its genre select, and the ruled grid of poster rows.
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <div className="mb-14">
          <PageTitleSkeleton titleClassName="w-52" />
          <FiltersRowSkeleton filters={['w-[200px]']} searchClassName="max-w-none flex-1" />
          <RuledGrid className="grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <MediaRowCellSkeleton key={i} media="h-14 w-10" />
            ))}
          </RuledGrid>
        </div>
      </div>
    </div>
  );
}
