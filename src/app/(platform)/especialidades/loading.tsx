import {
  PageHeaderSkeleton,
  PageTitleSkeleton,
  ProseSkeleton,
} from '@/components/skeletons/page-skeletons';

export default function Loading() {
  return (
    <>
      <PageHeaderSkeleton breadcrumbs={1} />
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <PageTitleSkeleton />
          <ProseSkeleton paragraphs={10} />
        </div>
      </div>
    </>
  );
}
