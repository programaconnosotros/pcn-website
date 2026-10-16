import { PageTitleSkeleton, RuledGridSkeleton } from '@/components/skeletons/page-skeletons';

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-28" />
        <RuledGridSkeleton count={6} className="grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3" />
      </div>
    </div>
  );
}
