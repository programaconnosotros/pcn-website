import {
  PageHeaderSkeleton,
  TitleRowSkeleton,
  CardListSkeleton,
} from '@/components/skeletons/page-skeletons';

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton breadcrumbs={1} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <TitleRowSkeleton withAction />
          <CardListSkeleton count={6} variant="grid" withImage />
        </div>
      </div>
    </>
  );
}
