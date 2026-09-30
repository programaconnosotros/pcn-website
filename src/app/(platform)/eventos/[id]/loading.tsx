import {
  PageHeaderSkeleton,
  PageTitleSkeleton,
  DetailTwoColumnSkeleton,
} from '@/components/skeletons/page-skeletons';

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton breadcrumbs={3} />
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <PageTitleSkeleton />
          <DetailTwoColumnSkeleton />
        </div>
      </div>
    </>
  );
}
