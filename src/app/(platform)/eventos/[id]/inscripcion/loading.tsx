import {
  PageHeaderSkeleton,
  PageTitleSkeleton,
  FormSkeleton,
} from '@/components/skeletons/page-skeletons';

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton breadcrumbs={4} />
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <PageTitleSkeleton />
          <FormSkeleton rows={5} />
        </div>
      </div>
    </>
  );
}
