import { MediaRowCellSkeleton } from '@/components/skeletons/list-skeletons';
import { PageTitleSkeleton, SearchBarSkeleton } from '@/components/skeletons/page-skeletons';
import { RuledGrid } from '@/components/ui/ruled-grid';

// Title, the search bar and the ruled grid of app rows with their logo.
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-56" />
        <div className="mb-4">
          <SearchBarSkeleton />
        </div>
        <RuledGrid className="grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <MediaRowCellSkeleton key={i} media="h-9 w-9" />
          ))}
        </RuledGrid>
      </div>
    </div>
  );
}
