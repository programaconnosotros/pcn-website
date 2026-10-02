import { PageTitleSkeleton, RuledGridSkeleton } from '@/components/skeletons/page-skeletons';

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton />
        <RuledGridSkeleton count={6} className="mb-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-6" />
        <RuledGridSkeleton count={1} className="mb-6 grid-cols-1 [&>*]:h-72" />
        <RuledGridSkeleton count={2} className="grid-cols-1 xl:grid-cols-2 [&>*]:h-80" />
      </div>
    </div>
  );
}
