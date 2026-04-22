import {
  PageHeaderSkeleton,
  TitleRowSkeleton,
  DetailTwoColumnSkeleton,
} from '@/components/skeletons/page-skeletons';

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton breadcrumbs={3} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <TitleRowSkeleton withAction />
          <DetailTwoColumnSkeleton />
        </div>
      </div>
    </>
  );
}
