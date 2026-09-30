import {
  PageHeaderSkeleton,
  PageTitleSkeleton,
  RuledGridSkeleton,
} from '@/components/skeletons/page-skeletons';

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton breadcrumbs={1} />
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <PageTitleSkeleton />
          <RuledGridSkeleton count={8} className="grid-cols-2 md:grid-cols-4" />
        </div>
      </div>
    </>
  );
}
