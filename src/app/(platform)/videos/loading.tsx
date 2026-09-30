import { PageTitleSkeleton, RuledGridSkeleton } from '@/components/skeletons/page-skeletons';

export default function Loading() {
  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <PageTitleSkeleton />
          <RuledGridSkeleton
            count={10}
            className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5"
          />
        </div>
      </div>
    </>
  );
}
